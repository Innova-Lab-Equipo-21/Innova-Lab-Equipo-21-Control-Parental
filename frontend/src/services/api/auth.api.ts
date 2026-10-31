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

export const authApi = {
  async register(data: RegisterPayload) {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.data?.token) {
      await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async login(data: LoginPayload) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.data?.token) {
      await safeStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async recoverPassword(email: string) {
    const response = await apiClient.post('/auth/recover-password', { email });
    return response.data;
  },

  async logout() {
    await safeStorage.removeItem('@ba_protege_jwt_token');
  },
};
