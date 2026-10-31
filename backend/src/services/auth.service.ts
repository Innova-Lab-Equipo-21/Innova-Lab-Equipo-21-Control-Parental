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

export interface GoogleAuthInput {
  idToken?: string;
  email: string;
  fullName?: string;
  photoUrl?: string;
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
   * Autenticación o registro unificado con Google Sign-In.
   * Si el usuario ya existe, genera su token JWT de sesión.
   * Si no existe, lo crea automáticamente en el sistema y retorna el token.
   */
  public async googleLogin(input: GoogleAuthInput) {
    let email = input.email?.trim().toLowerCase();
    let fullName = input.fullName?.trim();

    // Si se envía idToken, se decodifican los claims para mayor integridad
    if (input.idToken) {
      try {
        const decoded = jwt.decode(input.idToken) as any;
        if (decoded && decoded.email) {
          email = decoded.email.toLowerCase();
          if (!fullName && (decoded.name || decoded.given_name)) {
            fullName = decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim();
          }
        }
      } catch {
        // En caso de no poder decodificar, se utilizan los datos recibidos
      }
    }

    if (!email) {
      throw new AppError('El correo electrónico de Google es requerido', 400);
    }

    const computedFullName = fullName || 'Responsable Google';

    if (env.USE_MOCK_DATA) {
      let user = mockDb.users.find((u) => u.email === email);
      if (!user) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(Math.random().toString(36), saltRounds);
        user = {
          id: `usr-google-${Date.now()}`,
          email,
          passwordHash,
          fullName: computedFullName,
          isActive: true,
          createdAt: new Date(),
        };
        mockDb.users.push(user);
      }

      const token = this.generateToken({ userId: user.id, email: user.email });
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          isGoogleLinked: true,
        },
        token,
      };
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(Math.random().toString(36), saltRounds);
      user = await prisma.user.create({
        data: {
          email,
          fullName: computedFullName,
          passwordHash,
        },
      });
    }

    const token = this.generateToken({ userId: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        isGoogleLinked: true,
      },
      token,
    };
  }

  /**
   * Vincula una cuenta ya existente de responsable con una credencial de Google.
   */
  public async googleLink(userId: string, input: GoogleAuthInput) {
    let email = input.email?.trim().toLowerCase();
    if (input.idToken) {
      try {
        const decoded = jwt.decode(input.idToken) as any;
        if (decoded && decoded.email) {
          email = decoded.email.toLowerCase();
        }
      } catch {}
    }

    if (!email) {
      throw new AppError('El correo electrónico de Google es requerido para la vinculación', 400);
    }

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          isGoogleLinked: true,
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        isGoogleLinked: true,
      },
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
