import { api } from "@/lib/api";

export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data.user;
  },

  register: async (fullName: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
    });
    return response.data.user;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
};
