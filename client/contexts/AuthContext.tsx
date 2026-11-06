"use client";

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
  useContext,
} from "react";
import { AuthService } from "@/services/auth.service";
import type { AuthContextType, User } from "@/types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await AuthService.getCurrentUser();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    setUser(data);
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
  ) => {
    const data = await AuthService.register(fullName, email, password);
    setUser(data);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context) {
    return context;
  } else {
    throw new Error("Must be used within AuthProvider");
  }
}
