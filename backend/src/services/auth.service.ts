// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/services/auth.service.ts
// Descripción: Lógica de negocio para registro, autenticación y generación de tokens JWT.
// ==============================================================================

import { auth } from '../config/firebase.js';
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { Gender } from '@prisma/client';
import { env } from '../config/environment.js';
import { mockDb, MockUser } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { emailService } from './email.service.js';
import { getWelcomeEmail, getPasswordResetEmail } from '../templates/emails/index.js';
import { FirebaseAuthLoginResponse } from '../types/index.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_INFORMADO';
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

export interface UpdateProfileInput {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_INFORMADO';
  birthDate?: string;
  phone?: string;
  currentPassword?: string;
  password?: string;
}

function parseBirthDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4) {
      // DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatArgentineE164Phone(phone?: string): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('549') && digits.length >= 13) {
    return `+${digits}`;
  }
  if (digits.startsWith('54') && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `+549${digits}`;
  }
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }
  return undefined;
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
    const formattedCellPhone = formatArgentineE164Phone(input.phone);

    let firebaseUser: any = null;

    try {
      // 1. Crear el usuario en Firebase Authentication
      try {
        firebaseUser = await auth.createUser({
          email: cleanEmail,
          password: input.password,
          displayName: computedFullName,
          phoneNumber: formattedCellPhone,
          emailVerified: false,
        });
      } catch (err: any) {
        if (
          formattedCellPhone &&
          (err.code === 'auth/invalid-phone-number' ||
            err.code === 'auth/phone-number-already-exists')
        ) {
          // Si el teléfono no cumple E.164 estricto o ya está asociado en Firebase, creamos el usuario sin phoneNumber y lo persistimos en PostgreSQL
          firebaseUser = await auth.createUser({
            email: cleanEmail,
            password: input.password,
            displayName: computedFullName,
            emailVerified: false,
          });
        } else if (err.code === 'auth/email-already-exists') {
          // Si quedó huérfano en Firebase tras un fallo previo de DB, recuperamos el UID para completar el registro
          if (!env.USE_MOCK_DATA) {
            const existingDbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (!existingDbUser) {
              firebaseUser = await auth.getUserByEmail(cleanEmail);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

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

        // Obtenemos el token de autenticación para usarlo luego del registro
        const authData = await this.getAuthToken(cleanEmail, input.password);

        // Enviar email de bienvenida
        try {
          const tpl = getWelcomeEmail({ displayName: computedFullName, link: 'baprotege://activity' });
          await emailService.sendEmail(cleanEmail, tpl.subject, tpl.text, tpl.html).catch(() => {});
        } catch {}

        return {
          user: newUser,
          token: authData.idToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        };
      }

      const user = await prisma.user.create({
        data: {
          id: firebaseUser.uid, // Guardamos el UID de Firebase en la DB relacional
          email: cleanEmail,
          passwordHash: bcrypt.hashSync(input.password, 10),
          fullName: computedFullName,
          gender: (input.gender ? input.gender.toUpperCase().replace(/\s+/g, '_') : undefined) as
            | Gender
            | undefined,
          birthDate: parseBirthDate(input.birthDate),
          phone: input.phone || null,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          gender: true,
          birthDate: true,
          createdAt: true,
        },
      });

      // Obtenemos el token de autenticación para usarlo luego del registro
      const authData = await this.getAuthToken(cleanEmail, input.password);

      // Enviar email de bienvenida
      try {
        const tpl = getWelcomeEmail({ displayName: computedFullName, link: 'baprotege://activity' });
        await emailService.sendEmail(cleanEmail, tpl.subject, tpl.text, tpl.html).catch(() => {});
      } catch {}

      return {
        user,
        token: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: authData.expiresIn,
      };
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
   * Obtiene el token de autenticación de Firebase intercambiando las credenciales
   * por un ID Token, Refresh Token y su expiración.
   */
  private async getAuthToken(email: string, password: string) {
    const apiKey = env.FIREBASE_API_KEY;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          returnSecureToken: true,
        }),
      },
    );
    const data = (await response.json()) as FirebaseAuthLoginResponse;

    if (!response.ok) {
      throw new AppError('Credenciales inválidas o cuenta deshabilitada', 401);
    }

    return data;
  }

  /**
   * Autentica un usuario responsable y genera su token de sesión JWT.
   */
  public async login(input: LoginUserInput) {
    const cleanEmail = input.email.toLowerCase().trim();

    try {
      // Obtenemos el token de Firebase intercambiando las credenciales
      const data = await this.getAuthToken(cleanEmail, input.password);

      // Verificamos o sincronizamos que el usuario exista en DB / Mock local
      let userProfile;

      if (env.USE_MOCK_DATA) {
        userProfile = mockDb.users.find((u) => u.id === data.localId || u.email === cleanEmail);
      } else {
        try {
          userProfile = await prisma.user.findUnique({
            where: { id: data.localId },
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              gender: true,
              birthDate: true,
              createdAt: true,
            },
          });

          // Si el usuario existe en Firebase pero aún no en la tabla users de DB, lo creamos/sincronizamos
          if (!userProfile) {
            userProfile = await prisma.user.create({
              data: {
                id: data.localId,
                email: cleanEmail,
                fullName: data.displayName || 'Responsable',
                isActive: true,
              },
              select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                gender: true,
                birthDate: true,
                createdAt: true,
              },
            });
          }
        } catch (dbErr: any) {
          console.warn(
            '[AuthService] Advertencia al sincronizar usuario con base de datos:',
            dbErr.message,
          );
        }
      }

      let isGoogleLinked = false;
      try {
        if (auth && typeof auth.getUser === 'function') {
          const fbUser = await auth.getUser(data.localId);
          isGoogleLinked = fbUser.providerData.some(
            (p: { providerId?: string }) => p.providerId === 'google.com',
          );
        }
      } catch {
        // Silencioso si Firebase Admin no está disponible
      }

      return {
        user: {
          ...(userProfile || {
            id: data.localId,
            email: data.email,
            fullName: data.displayName || 'Responsable',
          }),
          isGoogleLinked,
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
   * Renueva el ID Token usando un Refresh Token de Firebase.
   * El Refresh Token tiene una larga duración y permite obtener nuevos tokens sin pedir la contraseña.
   */
  public async refreshToken(refreshToken: string) {
    const apiKey = env.FIREBASE_API_KEY;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/token?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }

    return {
      token: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Procesa la solicitud de recuperación de contraseña enviando instrucciones al correo.
   */
  public async recoverPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.email === cleanEmail);
      const displayName = user?.fullName || 'Responsable';
      const link = `https://baprotegemas.netlify.app/reset-password?email=${encodeURIComponent(cleanEmail)}`;
      try {
        const tpl = getPasswordResetEmail({ displayName, link });
        await emailService.sendEmail(cleanEmail, tpl.subject, tpl.text, tpl.html);
      } catch {
        // Fallo de envío en mock no se revela
      }
      return {
        email: cleanEmail,
        message:
          'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        sent: true,
      };
    }

    try {
      let displayName = 'Responsable';
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
          select: { fullName: true },
        });
        if (dbUser) displayName = dbUser.fullName;
      } catch {
        // Error de BD no se revela
      }

      let link: string;
      try {
        if (typeof auth?.generatePasswordResetLink === 'function') {
          link = await auth.generatePasswordResetLink(cleanEmail);
        } else {
          throw new Error('Firebase Auth no disponible');
        }
      } catch {
        link = `https://baprotegemas.netlify.app/reset-password?email=${encodeURIComponent(cleanEmail)}`;
      }

      try {
        const tpl = getPasswordResetEmail({ displayName, link });
        await emailService.sendEmail(cleanEmail, tpl.subject, tpl.text, tpl.html);
      } catch {
        // Fallo de envío no se revela
      }

      return {
        email: cleanEmail,
        message:
          'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
        sent: true,
      };
    } catch (error: any) {
      return {
        email: cleanEmail,
        message:
          'Si el correo está registrado en BA Protege+, recibirás las instrucciones de recuperación.',
      };
    }
  }

  /**
   * Intercambia un Google OAuth ID Token con Firebase Identity Toolkit (accounts:signInWithIdp)
   * para obtener o vincular un usuario de Firebase Auth y recibir un Firebase ID Token válido.
   */
  private async exchangeGoogleIdTokenWithFirebase(
    googleIdToken: string,
    currentFirebaseIdToken?: string,
  ) {
    const apiKey = env.FIREBASE_API_KEY;
    if (!apiKey) {
      return null;
    }

    const payload: Record<string, unknown> = {
      postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
      requestUri: 'http://localhost',
      returnIdpCredential: true,
      returnSecureToken: true,
    };

    if (currentFirebaseIdToken) {
      payload.idToken = currentFirebaseIdToken;
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      const errorCode = data?.error?.message || 'FIREBASE_IDP_ERROR';
      throw new Error(errorCode);
    }

    return {
      uid: data.localId as string,
      idToken: data.idToken as string,
      refreshToken: data.refreshToken as string | undefined,
      expiresIn: data.expiresIn as string | undefined,
      email: (data.email as string | undefined)?.trim().toLowerCase(),
      fullName: (data.fullName || data.displayName) as string | undefined,
      photoUrl: data.photoUrl as string | undefined,
    };
  }

  /**
   * Intercambia un Custom Token de Firebase Admin por un Firebase ID Token válido
   * (fallback cuando signInWithIdp no está disponible).
   */
  private async exchangeCustomTokenForIdToken(customToken: string) {
    const apiKey = env.FIREBASE_API_KEY;
    if (!apiKey) {
      return null;
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      },
    );

    const data = (await response.json()) as any;
    if (!response.ok) {
      return null;
    }

    return {
      idToken: data.idToken as string,
      refreshToken: data.refreshToken as string | undefined,
      expiresIn: data.expiresIn as string | undefined,
    };
  }

  /**
   * Autenticación o registro unificado con Google Sign-In.
   * Intercambia el Google OAuth ID Token por un Firebase ID Token válido
   * y sincroniza el perfil del responsable en la base de datos.
   */
  public async googleLogin(input: GoogleAuthInput) {
    let email = input.email?.trim().toLowerCase();
    let fullName = input.fullName?.trim();
    let firebaseUid: string | undefined;
    let firebaseToken: string | undefined;
    let refreshToken: string | undefined;
    let expiresIn: string | undefined;

    if (input.idToken) {
      // 1. Verificar si el cliente ya envió un Firebase ID Token válido
      if (auth && typeof auth.verifyIdToken === 'function') {
        try {
          const decoded = await auth.verifyIdToken(input.idToken);
          if (decoded?.uid) {
            firebaseUid = decoded.uid;
            firebaseToken = input.idToken;
            if (decoded.email) {
              email = decoded.email.toLowerCase();
            }
            if (!fullName && (decoded.name || decoded.given_name)) {
              fullName =
                decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim();
            }
          }
        } catch {
          // Es lo esperado cuando el cliente envía un Google OAuth ID Token
        }
      }

      // 2. Intercambiar Google OAuth ID Token por un Firebase Auth ID Token vía signInWithIdp
      if (!firebaseToken) {
        try {
          const idpResult = await this.exchangeGoogleIdTokenWithFirebase(input.idToken);
          if (idpResult) {
            firebaseUid = idpResult.uid;
            firebaseToken = idpResult.idToken;
            refreshToken = idpResult.refreshToken;
            expiresIn = idpResult.expiresIn;
            if (idpResult.email) {
              email = idpResult.email;
            }
            if (!fullName && idpResult.fullName) {
              fullName = idpResult.fullName;
            }
          }
        } catch (idpErr: any) {
          console.warn(
            '[AuthService] Error en Firebase signInWithIdp para Google Login:',
            idpErr?.message || idpErr,
          );
        }
      }
    }

    if (!email) {
      throw new AppError('El correo electrónico de Google es requerido', 400);
    }

    const computedFullName = fullName || 'Responsable Google';

    // 3. Si aún no tenemos Firebase ID Token, sincronizar/crear usuario en Firebase Admin y emitir token válido
    if (!firebaseToken && !env.USE_MOCK_DATA && auth && typeof auth.getUserByEmail === 'function') {
      try {
        let fbUser;
        try {
          fbUser = await auth.getUserByEmail(email);
        } catch (lookupErr: any) {
          if (lookupErr?.code === 'auth/user-not-found') {
            fbUser = await auth.createUser({
              email,
              displayName: computedFullName,
              emailVerified: true,
            });
          } else {
            throw lookupErr;
          }
        }

        if (fbUser?.uid) {
          firebaseUid = fbUser.uid;
          const customToken = await auth.createCustomToken(fbUser.uid);
          const exchanged = await this.exchangeCustomTokenForIdToken(customToken);
          if (exchanged?.idToken) {
            firebaseToken = exchanged.idToken;
            refreshToken = exchanged.refreshToken;
            expiresIn = exchanged.expiresIn;
          }
        }
      } catch (fbErr: any) {
        console.warn(
          '[AuthService] No se pudo emitir Firebase ID Token de respaldo para Google Login:',
          fbErr?.message || fbErr,
        );
      }
    }

    if (env.USE_MOCK_DATA) {
      let user = mockDb.users.find(
        (u) => (firebaseUid && u.id === firebaseUid) || u.email === email,
      );
      if (!user) {
        user = {
          id: firebaseUid || `usr-google-${Date.now()}`,
          email,
          fullName: computedFullName,
          isActive: true,
          createdAt: new Date(),
        };
        mockDb.users.push(user);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          isGoogleLinked: true,
        },
        token: firebaseToken || input.idToken || `mock-google-token-${user.id}`,
        ...(refreshToken ? { refreshToken } : {}),
        ...(expiresIn ? { expiresIn } : {}),
      };
    }

    let user = firebaseUid ? await prisma.user.findUnique({ where: { id: firebaseUid } }) : null;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          ...(firebaseUid ? { id: firebaseUid } : {}),
          email,
          fullName: computedFullName,
          passwordHash: 'GOOGLE_AUTH_FEDERATED',
          isActive: true,
        },
      });
    }

    const token = firebaseToken || input.idToken || `google-federated-token-${user.id}`;

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        birthDate: user.birthDate,
        phone: user.phone,
        createdAt: user.createdAt,
        isGoogleLinked: true,
      },
      token,
      ...(refreshToken ? { refreshToken } : {}),
      ...(expiresIn ? { expiresIn } : {}),
    };
  }

  /**
   * Vincula una cuenta ya existente de responsable con una credencial de Google.
   * Asocia el proveedor google.com al usuario actual en Firebase Auth.
   */
  public async googleLink(userId: string, input: GoogleAuthInput, currentFirebaseToken?: string) {
    let email = input.email?.trim().toLowerCase();
    let refreshedToken: string | undefined;

    if (input.idToken && currentFirebaseToken && !env.USE_MOCK_DATA) {
      try {
        const linked = await this.exchangeGoogleIdTokenWithFirebase(
          input.idToken,
          currentFirebaseToken,
        );
        if (linked) {
          refreshedToken = linked.idToken;
          if (linked.email) {
            email = linked.email;
          }
        }
      } catch (linkErr: any) {
        const errCode = String(linkErr?.message || '');
        if (
          errCode.includes('FEDERATED_USER_ID_ALREADY_LINKED') ||
          errCode.includes('EMAIL_EXISTS')
        ) {
          // Verificar si ya está vinculada a ESTE mismo usuario o a otro
          let alreadyLinkedToSelf = false;
          if (auth && typeof auth.getUser === 'function') {
            try {
              const fbUser = await auth.getUser(userId);
              alreadyLinkedToSelf = fbUser.providerData.some(
                (p: { providerId?: string; email?: string }) =>
                  p.providerId === 'google.com' && (!email || p.email?.toLowerCase() === email),
              );
            } catch {
              // Ignorar
            }
          }
          if (!alreadyLinkedToSelf) {
            throw new AppError(
              'Esta cuenta de Google ya se encuentra vinculada a otro usuario.',
              409,
            );
          }
        } else {
          console.warn(
            '[AuthService] Advertencia al vincular proveedor Google en Firebase:',
            errCode,
          );
        }
      }
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
        ...(refreshedToken ? { token: refreshedToken } : {}),
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
        gender: user.gender,
        birthDate: user.birthDate,
        phone: user.phone,
        createdAt: user.createdAt,
        isGoogleLinked: true,
      },
      ...(refreshedToken ? { token: refreshedToken } : {}),
    };
  }

  /**
   * Actualiza el perfil de un usuario responsable.
   */
  public async updateProfile(userId: string, input: UpdateProfileInput) {
    const computedFullName =
      input.fullName || [input.firstName, input.lastName].filter(Boolean).join(' ') || undefined;
    const cleanPhone = input.phone !== undefined ? input.phone.trim() : undefined;
    const birthDateObj =
      input.birthDate !== undefined ? parseBirthDate(input.birthDate) : undefined;
    const genderEnum = input.gender
      ? (input.gender.toUpperCase().replace(/\s+/g, '_') as Gender)
      : undefined;

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId) as any;
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }
      if (computedFullName) user.fullName = computedFullName;
      if (cleanPhone !== undefined) user.phone = cleanPhone || null;
      if (genderEnum !== undefined) user.gender = genderEnum;
      if (birthDateObj !== undefined) user.birthDate = birthDateObj;
      return user;
    }

    // 0. Si el usuario solicita cambiar la contraseña y envió su contraseña actual, validarla
    if (input.password && input.password.length >= 6 && input.currentPassword) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, passwordHash: true },
      });

      if (!existingUser) {
        throw new AppError('Usuario no encontrado', 404);
      }

      let currentPasswordValid = false;
      if (existingUser.passwordHash && existingUser.passwordHash !== 'GOOGLE_AUTH_FEDERATED') {
        currentPasswordValid = bcrypt.compareSync(input.currentPassword, existingUser.passwordHash);
      }

      if (!currentPasswordValid && existingUser.email) {
        try {
          await this.getAuthToken(existingUser.email, input.currentPassword);
          currentPasswordValid = true;
        } catch {
          currentPasswordValid = false;
        }
      }

      if (!currentPasswordValid) {
        throw new AppError('La contraseña actual es incorrecta.', 400);
      }
    }

    // 1. Sincronizar con Firebase Authentication (nombre, contraseña y teléfono)
    if (auth) {
      const fbUpdate: any = {};
      if (computedFullName) fbUpdate.displayName = computedFullName;
      if (input.password && input.password.length >= 6) fbUpdate.password = input.password;
      if (cleanPhone) {
        const formattedE164 = formatArgentineE164Phone(cleanPhone);
        if (formattedE164) {
          fbUpdate.phoneNumber = formattedE164;
        }
      }

      if (Object.keys(fbUpdate).length > 0) {
        try {
          await auth.updateUser(userId, fbUpdate);
        } catch (fbErr: any) {
          console.warn('⚠️ No se pudo sincronizar actualización con Firebase:', fbErr?.message);
        }
      }
    }

    // 2. Actualizar en PostgreSQL
    const dataToUpdate: any = {};
    if (computedFullName !== undefined) dataToUpdate.fullName = computedFullName;
    if (cleanPhone !== undefined) dataToUpdate.phone = cleanPhone || null;
    if (birthDateObj !== undefined) dataToUpdate.birthDate = birthDateObj;
    if (genderEnum !== undefined) dataToUpdate.gender = genderEnum;
    if (input.password && input.password.length >= 6) {
      dataToUpdate.passwordHash = bcrypt.hashSync(input.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        gender: true,
        birthDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Elimina definitivamente la cuenta de un usuario responsable y todos sus datos en cascada.
   */
  public async deleteAccount(userId: string) {
    if (env.USE_MOCK_DATA) {
      const idx = mockDb.users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        mockDb.users.splice(idx, 1);
      }
      return { success: true, message: 'Cuenta eliminada exitosamente' };
    }

    // 1. Eliminar en Firebase Authentication
    if (auth) {
      try {
        await auth.deleteUser(userId);
      } catch (fbErr: any) {
        console.warn('⚠️ No se pudo eliminar usuario en Firebase Auth:', fbErr?.message);
      }
    }

    // 2. Eliminar en PostgreSQL en transacción en cascada segura
    await prisma.$transaction(async (tx) => {
      // Dispositivos y sus registros dependientes
      const devices = await tx.device.findMany({
        where: { userId },
        select: { id: true },
      });
      const deviceIds = devices.map((d) => d.id);

      if (deviceIds.length > 0) {
        await tx.deviceStatus.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.protectionConfig.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.blockedEvent.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.securityEvent.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.pasatiempoSession.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.appUsageSnapshot.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.devicePairing.deleteMany({ where: { deviceId: { in: deviceIds } } });
        await tx.device.deleteMany({ where: { id: { in: deviceIds } } });
      }

      // Listas personalizadas y sus dominios
      const blocklists = await tx.blocklist.findMany({
        where: { userId },
        select: { id: true },
      });
      const blocklistIds = blocklists.map((b) => b.id);
      if (blocklistIds.length > 0) {
        await tx.blocklistDomain.deleteMany({ where: { blocklistId: { in: blocklistIds } } });
        await tx.blocklist.deleteMany({ where: { id: { in: blocklistIds } } });
      }

      // Pareamientos y auditorías
      await tx.devicePairing.deleteMany({ where: { userId } });
      await tx.auditLog.deleteMany({ where: { userId } });

      // Eliminar el usuario
      await tx.user.delete({ where: { id: userId } });
    });

    return { success: true, message: 'Cuenta y datos asociados eliminados definitivamente' };
  }
}

export const authService = new AuthService();
