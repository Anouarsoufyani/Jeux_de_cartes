import { AxiosResponse } from "axios";
import { http } from "../utils";

export interface loginResponseDto {
  success: boolean;
  id?: string;
  username?: string;
  token?: string;
  errors?: {
    email?: string;
    password?: string;
  };
}

export interface loginRequestDto {
  email: string;
  password: string;
}

export interface registerRequestDto {
  username: string;
  email: string;
  password: string;
}

export interface registerResponseDto {
  success: boolean;
  errors?: {
    username?: string;
    email?: string;
    password?: string;
  };
}

export const AuthService = {
  register: async (
    data: registerRequestDto
  ): Promise<AxiosResponse<registerResponseDto>> => {
    return http.post(`/auth/register`, data);
  },

  login: async (
    data: loginRequestDto
  ): Promise<AxiosResponse<loginResponseDto>> => {
    return http.post("/auth/login", data);
  },

  getAllUsers: async (): Promise<AxiosResponse<any>> => {
    return http.get("/auth");
  },
};
