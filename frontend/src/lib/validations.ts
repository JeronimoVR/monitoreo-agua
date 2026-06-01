import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.email('Ingresa un correo electrónico válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const forgotPasswordSchema = z.object({
  correo: z.email('Ingresa un correo electrónico válido'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto').trim(),
  correo: z.email('Correo electrónico no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;