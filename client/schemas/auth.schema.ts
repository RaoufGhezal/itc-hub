import z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  tos: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service",
  }),
});

export const createAuthSchema = (isLogin: boolean) =>
  z
    .object({
      fullName: z.string(),
      email: z.string().email("Invalid email"),
      password: z.string().min(6, "Password too short"),
      tos: z.boolean(),
    })
    .refine((data) => isLogin || data.fullName.trim().length > 0, {
      message: "Full name is required",
      path: ["fullName"],
    });
