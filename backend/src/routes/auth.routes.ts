// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/routes/auth.routes.ts
// Descripción: Definición de rutas y validaciones para autenticación de usuarios.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Letras latinas con todos los acentos/diacríticos (áéíóúüñçãõâêô, etc.), espacios, apóstrofes y guiones
const NAME_LETTERS_REGEX =
  /^(?=.*[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u1E00-\u1EFF])[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u1E00-\u1EFF\u0300-\u036F\s'’-]+$/;

// Esquema de validación para registro
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    fullName: z.string().min(2, 'El nombre completo es requerido').optional(),
    firstName: z
      .string()
      .regex(NAME_LETTERS_REGEX, 'El nombre solo puede contener letras')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .optional(),
    lastName: z
      .string()
      .regex(NAME_LETTERS_REGEX, 'El apellido solo puede contener letras')
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
        },
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

// Esquema de validación para autenticación con Google
const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().optional(),
    email: z.string().email('Correo electrónico inválido'),
    fullName: z.string().optional(),
    photoUrl: z.string().optional(),
  }),
});

// Esquema de validación para refresh token
const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido'),
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

// Esquema de validación para actualizar perfil
const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres').optional(),
    firstName: z
      .string()
      .regex(NAME_LETTERS_REGEX, 'El nombre solo puede contener letras')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .optional(),
    lastName: z
      .string()
      .regex(NAME_LETTERS_REGEX, 'El apellido solo puede contener letras')
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
          const [d, m, y] = val.split(/[/.-]/).map(Number);
          if (!d || !m || !y) return false;
          const today = new Date();
          let age = today.getFullYear() - y;
          const mDiff = today.getMonth() + 1 - m;
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) age--;
          return age >= 18;
        },
        {
          message: 'Solo personas adultas (+18) pueden registrarse o mantener cuenta en Modo Responsable',
        },
      ),
    phone: z.string().optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  }),
});

router.post('/register', validateRequest(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);

router.post('/login', validateRequest(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

router.post('/google', validateRequest(googleAuthSchema), (req, res, next) =>
  authController.googleLogin(req, res, next),
);

router.post('/google/link', requireAuth, validateRequest(googleAuthSchema), (req, res, next) =>
  authController.googleLink(req, res, next),
);

router.post('/refresh-token', validateRequest(refreshTokenSchema), (req, res, next) =>
  authController.refreshToken(req, res, next),
);

router.post('/recover-password', validateRequest(recoverPasswordSchema), (req, res, next) =>
  authController.recoverPassword(req, res, next),
);

router.post('/location', validateRequest(locationSchema), (req, res, next) =>
  authController.updateLocation(req, res, next),
);

router.post('/fcm-token', requireAuth, (req, res, next) =>
  authController.registerFcmToken(req, res, next),
);

router.put('/profile', requireAuth, validateRequest(updateProfileSchema), (req, res, next) =>
  authController.updateProfile(req, res, next),
);

router.delete('/account', requireAuth, (req, res, next) =>
  authController.deleteAccount(req, res, next),
);

export const authRoutes = router;
