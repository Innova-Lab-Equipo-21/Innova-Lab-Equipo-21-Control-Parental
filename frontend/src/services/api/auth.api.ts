// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autenticación de Responsable (Auth API)
// Archivo: src/services/api/auth.api.ts
// Descripción: Servicio HTTP para registro, inicio de sesión, Google Sign-In,
//              renovación de token, recuperación de contraseña, edición de perfil
//              y eliminación de cuenta contra el backend real.
// ==============================================================================

import { apiClient, safeStorage } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken?: string;
  email: string;
  fullName?: string;
  photoUrl?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  currentPassword?: string;
  password?: string;
}

async function persistAuthTokens(data?: { token?: string; refreshToken?: string }): Promise<void> {
  if (data?.token) {
    await safeStorage.setItem('@ba_protege_jwt_token', data.token);
  }
  if (data?.refreshToken) {
    await safeStorage.setItem('@ba_protege_refresh_token', data.refreshToken);
  }
}

function normalizeAuthError(error: any, fallbackMessage: string): Error {
  if (error?.response?.data?.message) {
    const err = new Error(error.response.data.message);
    (err as any).response = error.response;
    return err;
  }
  if (
    !error?.response ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.message?.includes('Network Error')
  ) {
    return new Error('No pudimos conectar con el servidor. Verificá tu conexión a internet.');
  }
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export const authApi = {
  async register(data: RegisterPayload) {
    try {
      const response = await apiClient.post('/auth/register', data);
      await persistAuthTokens(response.data?.data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'Error al registrar la cuenta.');
    }
  },

  async login(data: LoginPayload) {
    try {
      const response = await apiClient.post('/auth/login', data);
      await persistAuthTokens(response.data?.data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'Error al iniciar sesión.');
    }
  },

  async googleAuth(data: GoogleAuthPayload) {
    try {
      const response = await apiClient.post('/auth/google', data);
      await persistAuthTokens(response.data?.data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'Error al autenticar con Google.');
    }
  },

  async googleLink(data: GoogleAuthPayload) {
    try {
      const response = await apiClient.post('/auth/google/link', data);
      await persistAuthTokens(response.data?.data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'Error al vincular la cuenta de Google.');
    }
  },

  async refreshToken(refreshToken?: string) {
    try {
      const tokenToUse = refreshToken || (await safeStorage.getItem('@ba_protege_refresh_token'));
      if (!tokenToUse) {
        throw new Error('No hay un token de actualización disponible.');
      }
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken: tokenToUse,
      });
      await persistAuthTokens(response.data?.data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'No se pudo renovar la sesión.');
    }
  },

  async recoverPassword(email: string) {
    try {
      const response = await apiClient.post('/auth/recover-password', { email });
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'No se pudo procesar la recuperación de contraseña.');
    }
  },

  async logout() {
    await safeStorage.removeItem('@ba_protege_jwt_token');
    await safeStorage.removeItem('@ba_protege_refresh_token');
    await safeStorage.removeItem('@ba_protege_self_device');
    await safeStorage.removeItem('@ba_protege_self_control_active');
    await safeStorage.removeItem('@ba_protege_self_control_enabled_at');
    await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
  },

  async updateProfile(data: UpdateProfilePayload) {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'No se pudo actualizar el perfil.');
    }
  },

  async deleteAccount() {
    try {
      const response = await apiClient.delete('/auth/account');
      await safeStorage.removeItem('@ba_protege_jwt_token');
      await safeStorage.removeItem('@ba_protege_refresh_token');
      await safeStorage.removeItem('@ba_protege_self_device');
      await safeStorage.removeItem('@ba_protege_self_control_active');
      await safeStorage.removeItem('@ba_protege_self_control_enabled_at');
      await safeStorage.removeItem('@ba_protege_self_control_can_disable_at');
      return response.data;
    } catch (error: any) {
      throw normalizeAuthError(error, 'No se pudo eliminar la cuenta.');
    }
  },

  async registerFcmToken(fcmToken: string) {
    try {
      const response = await apiClient.post('/auth/fcm-token', { fcmToken });
      return response.data;
    } catch (e) {
      // Silencioso si falla
    }
  },
};
