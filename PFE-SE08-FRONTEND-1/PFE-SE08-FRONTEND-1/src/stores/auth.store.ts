import { secureStorage } from "@/lib/secureStorage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginService, LoginCredentials } from "@/services/auth-services";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: string | null;
  error: string | null;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
      role: null,
      loginWithCredentials: async (credentials: LoginCredentials) => {
        try {
          const response = await loginService(credentials);
          
          if (!response.token) {
            throw new Error("Invalid login response");
          }
          
          // Extract role from JWT token (assuming role is in the 'iss' claim)
          const tokenParts = response.token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error("Invalid token format");
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          const role = payload.iss || 'user'; // Default to 'user' if no role found
          
          set({
            token: response.token,
            username: credentials.username,
            isAuthenticated: true,
            isAdmin: role.includes("ADMIN"),
            error: null,
            role,
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Login failed" });
          throw err;
        }
      },
      login: (token: string, username: string, role: string) => {
        try {
          if (!token || !username) {
            throw new Error("Invalid login credentials");
          }
          set({
            token,
            username,
            isAuthenticated: true,
            isAdmin: role.includes("ADMIN"),
            error: null,
            role,
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : "Login failed" });
          throw err;
        }
      },
      logout: () =>
        set({
          token: null,
          username: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
          role: null,
        }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        isAdmin: state.isAdmin,
      }),
    }
  )
);