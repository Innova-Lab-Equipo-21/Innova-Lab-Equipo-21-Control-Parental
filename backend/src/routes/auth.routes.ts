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
    birthDate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          if (val.length !== 10) return false;
          const [d, m, y] = val.split('/').map(Number);
          if (!d || !m || !y) return false;
          const today = new Date();
          let age = today.getFullYear() - y;
          const mDiff = today.getMonth() + 1 - m;
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) age--;
          return age >= 18;
        },
        {
          message: 'Solo personas adultas (+18) pueden registrarse en el Modo Responsable',
        }
      ),
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

// Esquema de validación para ubicación
const locationSchema = z.object({
  body: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    source: z.enum(['GPS', 'IP']).optional(),
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

router.post('/location', validateRequest(locationSchema), (req, res, next) =>
  authController.updateLocation(req, res, next),
);

export const authRoutes = router;
