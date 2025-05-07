import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

const CRYPTO_KEY: string = "your-secure-encryption-key"; // Ensure this is securely managed in production

export const secureStorage = {
  getItem: (name: string): string | null => {
    const data: string | undefined = Cookies.get(name);
    if (!data) return null;
    try {
      const decrypted: string = CryptoJS.AES.decrypt(data, CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted: string = CryptoJS.AES.encrypt(value, CRYPTO_KEY).toString();
    Cookies.set(name, encrypted, { expires: 7, secure: true, sameSite: 'strict' }); // Adjust cookie options as needed
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};