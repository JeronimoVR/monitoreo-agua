import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Ingresa un correo electrónico válido'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const registerSchema = z.object({
  nombre: z.string().min(3, 'Nombre demasiado corto'),
  email: z.email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});