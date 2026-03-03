import { apiClient } from "./client";

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; role: string };
}

export interface SecretQuestion {
  id: string;
  question: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  nationalId: string;
  phoneNumber: string;
  vendorName: string;
  vendorDescription?: string;
  preferredCategoryIds?: string[];
  secretQuestionId: string;
  secretAnswer: string;
}

export const authApi = {
  getSecretQuestions: async (): Promise<SecretQuestion[]> => {
    const { data } = await apiClient.get<SecretQuestion[]>("/auth/secret-questions");
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse & { emailVerificationRequired?: boolean }> => {
    const { data } = await apiClient.post("/auth/register", input);
    return data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/refresh");
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  forgotPassword: async (email: string): Promise<{ secretQuestion: string }> => {
    const { data } = await apiClient.post<{ secretQuestion: string }>("/auth/forgot-password", {
      email,
    });
    return data;
  },

  resetPassword: async (
    email: string,
    secretAnswer: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post("/auth/reset-password", {
      email,
      secretAnswer,
      newPassword,
    });
  },
};
