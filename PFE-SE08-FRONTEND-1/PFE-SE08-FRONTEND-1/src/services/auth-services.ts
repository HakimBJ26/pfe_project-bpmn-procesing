import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}

export const loginService = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post("/v1/auth/login", credentials);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};

export const registerService = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post("/v1/auth/register", credentials);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError;
  }
};
