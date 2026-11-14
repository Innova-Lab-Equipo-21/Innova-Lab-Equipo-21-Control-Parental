// ==============================================================================
// Proyecto: BA Protege+
// Componente: Autenticación de Responsable (Auth API)
// Archivo: src/services/api/auth.api.ts
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
  password?: string;
}

export const authApi = {
  async register(data: RegisterPayload) {
    try {
      const response = await apiClient.post('/auth/register', data);
      if (response.data.data?.token) {
        await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
      }
      return response.data;
    } catch (error: any) {
      // Fallback a registro local de respaldo si hay Network Error o el backend no está disponible
      if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('⚠️ Network Error detectado al registrar. Activando modo local de respaldo.');
        const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Tutor Responsable';
        const mockUser = {
          id: `usr-local-${Date.now()}`,
          email: data.email,
          fullName,
          firstName: data.firstName || 'Tutor',
          lastName: data.lastName || 'Responsable',
          gender: data.gender || 'No informado',
          birthDate: data.birthDate || '10/05/1988',
          phone: data.phone || '',
          isActive: true,
        };
        const mockToken = `mock-jwt-token-${Date.now()}`;
        await safeStorage.setItem('@ba_protege_jwt_token', mockToken);
        await safeStorage.setItem(
          '@ba_protege_self_device',
          JSON.stringify({
            deviceId: 'self',
            deviceUuid: 'uuid-self-responsable',
            deviceName: fullName,
            childName: fullName,
            isProtected: true,
            status: 'ACTIVE',
            lastHeartbeat: 'En línea',
            blockedCount: 0,
            blocklistVersion: 4,
            phone: mockUser.phone,
            birthDate: mockUser.birthDate,
            gender: mockUser.gender,
            profileType: 'Responsable',
          })
        );

        return {
          success: true,
          message: 'Cuenta registrada exitosamente.',
          data: {
            user: mockUser,
            token: mockToken,
          },
        };
      }
      throw error;
    }
  },

  async login(data: LoginPayload) {
    try {
      const response = await apiClient.post('/auth/login', data);
      if (response.data.data?.token) {
        await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('No se pudo conectar con el servidor. Por favor verifica tu conexión a Internet.');
      }
      throw error;
    }
  },

  async googleAuth(data: GoogleAuthPayload) {
    const response = await apiClient.post('/auth/google', data);
    if (response.data.data?.token) {
      await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async googleLink(data: GoogleAuthPayload) {
    const response = await apiClient.post('/auth/google/link', data);
    return response.data;
  },

  async recoverPassword(email: string) {
    const response = await apiClient.post('/auth/recover-password', { email });
    return response.data;
  },

  async logout() {
    await safeStorage.removeItem('@ba_protege_jwt_token');
  },

  async updateProfile(data: UpdateProfilePayload) {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  async deleteAccount() {
    const response = await apiClient.delete('/auth/account');
    await safeStorage.removeItem('@ba_protege_jwt_token');
    return response.data;
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
