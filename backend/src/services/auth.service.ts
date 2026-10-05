// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/services/auth.service.ts
// Descripción: Lógica de negocio para registro, autenticación y generación de tokens JWT.
// ==============================================================================

import { auth } from '../config/firebase.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockUser } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { FirebaseAuthLoginResponse } from '../types/index.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Registra un nuevo usuario responsable (padre/tutor) en el sistema.
   */
  public async register(input: RegisterUserInput) {
    const computedFullName =
      input.fullName ||
      [input.firstName, input.lastName].filter(Boolean).join(' ') ||
      'Responsable';
    const cleanEmail = input.email.toLowerCase().trim();

    try {
      // 1. Crear el usuario en Firebase Authentication
      const firebaseUser = await auth.createUser({
        email: cleanEmail,
        password: input.password,
        displayName: computedFullName,
        phoneNumber: input.phone || undefined,
        emailVerified: false,
      });

      // 2. Persistir el perfil en base de datos local o Mock usando el firebaseUser.uid
      if (env.USE_MOCK_DATA) {
        const newUser: MockUser = {
          id: firebaseUser.uid, // Usamos el UID de Firebase como ID principal
          email: cleanEmail,
          fullName: computedFullName,
          isActive: true,
          createdAt: new Date(),
        };

        mockDb.users.push(newUser);

        return {
          user: newUser,
        };
      }

      const user = await prisma.user.create({
        data: {
          id: firebaseUser.uid, // Guardamos el UID de Firebase en la DB relacional
          email: cleanEmail,
          fullName: computedFullName,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });

      return { user };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new AppError('El correo electrónico ya se encuentra registrado', 409);
      }
      if (error.code === 'auth/weak-password') {
        throw new AppError('La contraseña proporcionada es demasiado débil', 400);
      }
      throw error;
    }
  }

  /**
   * Autentica un usuario responsable y genera su token de sesión JWT.
   */
  public async login(input: LoginUserInput) {
    const cleanEmail = input.email.toLowerCase().trim();

    try {
      // Intercambiamos credenciales usando la API pública de Firebase Auth
      const apiKey = env.FIREBASE_API_KEY;
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: input.password,
            returnSecureToken: true,
          }),
        },
      );
      const data = (await response.json()) as FirebaseAuthLoginResponse;

      if (!response.ok) {
        throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
      }

      // Verificamos o sincronizamos que el usuario exista en DB / Mock local
      let userProfile;

      if (env.USE_MOCK_DATA) {
        userProfile = mockDb.users.find((u) => u.id === data.localId || u.email === cleanEmail);
      } else {
        userProfile = await prisma.user.findUnique({
          where: { id: data.localId },
          select: { id: true, email: true, fullName: true, createdAt: true },
        });
      }

      return {
        user: userProfile || {
          id: data.localId,
          email: data.email,
        },
        token: data.idToken, // ID Token de Firebase para ser usado en el header Authorization
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
    }
  }
  /**
   * Procesa la solicitud de recuperación de contraseña enviando instrucciones al correo.
   */
  public async recoverPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    // Verificamos existencia si se usa mock o base de datos real
    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.email === cleanEmail);
      // Por motivos de seguridad estándar, respondemos con éxito independientemente de la existencia
      return {
        email: cleanEmail,
        message:
          'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        sent: !!user,
      };
    }

    try {
      const resetLink = await auth.generatePasswordResetLink(cleanEmail);

      return {
        email: cleanEmail,
        message:
          'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        resetLink, // Útil durante desarrollo / testing
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return {
          email: cleanEmail,
          message:
            'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        };
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
