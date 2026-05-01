import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const forgotPasswordSchema = z.object({
  correo: z.email('Ingresa un correo electrónico válido'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre es muy corto'),
  correo: z.email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});