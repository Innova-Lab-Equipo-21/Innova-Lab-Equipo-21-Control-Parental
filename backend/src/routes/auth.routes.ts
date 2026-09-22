// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/auth.routes.ts
// Descripción: Definición de rutas y validaciones para autenticación de usuarios.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Esquema de validación para registro
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    fullName: z.string().min(2, 'El nombre completo es requerido').optional(),
    firstName: z
      .string()
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .optional(),
    lastName: z
      .string()
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras')
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .optional(),
    gender: z.enum(['Masculino', 'Femenino', 'Otro', 'No informado']).optional(),
    birthDate: z.string().optional(),
    phone: z.string().optional(),
  }),
});

// Esquema de validación para login
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

// Esquema de validación para recuperar contraseña
const recoverPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico inválido'),
  }),
});

router.post('/register', validateRequest(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);

router.post('/login', validateRequest(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

router.post('/recover-password', validateRequest(recoverPasswordSchema), (req, res, next) =>
  authController.recoverPassword(req, res, next),
);

export const authRoutes = router;
