"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createAuthSchema } from "@/schemas/auth.schema";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type AuthFormData = {
  fullName: string;
  email: string;
  password: string;
  tos: boolean;
};

export type AuthMode = "login" | "register";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  redirectTo?: string;
}

export default function AuthDialog({
  open,
  onClose,
  mode,
  onModeChange,
  redirectTo,
}: AuthDialogProps) {
  const router = useRouter();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const isLogin = mode === "login";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(createAuthSchema(isLogin)),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      tos: false,
    },
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const toggleMode = () => {
    setFormError("");
    reset();
    setShowPassword(false);
    onModeChange(isLogin ? "register" : "login");
  };

  const onSubmit = async (data: AuthFormData) => {
    setFormError("");
    try {
      if (isLogin) {
        await auth.login(data.email, data.password);
        toast.success("Login successful");
      } else {
        await auth.register(data.fullName, data.email, data.password);
        toast.success("Account created successfully");
      }
      onClose();
      router.push(redirectTo ?? "/");
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setFormError(
        message || (isLogin ? "Failed to log in" : "Failed to create account"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Log in to access your ITC Hub account."
              : "Sign up to join events and explore ITC Hub."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-500 transition-colors hover:text-neutral-300"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-4 w-4" />
                ) : (
                  <FaEye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {formError && (
            <p className="text-sm font-medium text-red-500">{formError}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer"
          >
            {isSubmitting
              ? "Please wait..."
              : isLogin
                ? "Login"
                : "Create account"}
          </Button>

          <p className="text-center text-sm text-neutral-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="cursor-pointer font-medium text-red-500 transition-colors hover:text-red-400"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
