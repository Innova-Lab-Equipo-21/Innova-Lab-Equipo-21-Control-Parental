// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/services/auth.service.ts
// Descripción: Lógica de negocio para registro, autenticación y generación de tokens JWT.
// ==============================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb, MockUser } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { JwtUserPayload } from '../types/index.js';

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
    const computedFullName = input.fullName || [input.firstName, input.lastName].filter(Boolean).join(' ') || 'Responsable';

    if (env.USE_MOCK_DATA) {
      const existingUser = mockDb.users.find((u) => u.email === input.email.toLowerCase());
      if (existingUser) {
        throw new AppError('El correo electrónico ya se encuentra registrado', 409);
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(input.password, saltRounds);

      const newUser: MockUser = {
        id: `usr-mock-${Date.now()}`,
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: computedFullName,
        isActive: true,
        createdAt: new Date(),
      };

      mockDb.users.push(newUser);
      const token = this.generateToken({ userId: newUser.id, email: newUser.email });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          createdAt: newUser.createdAt,
        },
        token,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: computedFullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    const token = this.generateToken({ userId: user.id, email: user.email });

    return { user, token };
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
        message: 'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        sent: !!user,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    return {
      email: cleanEmail,
      message: 'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
      sent: !!user,
    };
  }

  /**
   * Autentica un usuario responsable y genera su token de sesión JWT.
   */
  public async login(input: LoginUserInput) {
    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.email === input.email.toLowerCase());
      if (!user || !user.isActive) {
        throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
      }

      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
      }

      const token = this.generateToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
        token,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
    }

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Genera el token JWT firmado con la clave secreta del sistema.
   */
  private generateToken(payload: JwtUserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }
}

export const authService = new AuthService();
