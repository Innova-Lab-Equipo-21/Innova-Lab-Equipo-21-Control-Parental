// ==============================================================================
// Proyecto: BA Protege+
// Componente: API Client Core & Storage
// Archivo: src/services/api/client.ts
// Descripción: Cliente HTTP Axios autenticado con JWT, almacenamiento seguro y proveedor de tiempo del servidor.
// ==============================================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de la API en producción (Railway HTTPS -> puerto interno 3000)
export const BASE_API_URL =
  'https://innova-lab-equipo-21-control-parental-ba-protege.up.railway.app/api';

const memoryStorage = new Map<string, string>();

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (memoryStorage.has(key)) {
        return memoryStorage.get(key) || null;
      }
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          memoryStorage.set(key, value);
        }
        return value;
      }
    } catch (e) {
      // Fallback
    }
    return memoryStorage.get(key) || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // Fallback
    }
  },
  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Fallback
    }
  },
  clearMemory(): void {
    memoryStorage.clear();
  },
};

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT si está guardado en sesión
apiClient.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem('@ba_protege_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Renovación automática de ID Token expirado usando Refresh Token de Firebase (single-flight)
let pendingRefreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (pendingRefreshPromise) {
    return pendingRefreshPromise;
  }

  pendingRefreshPromise = (async () => {
    try {
      const storedRefreshToken = await safeStorage.getItem('@ba_protege_refresh_token');
      if (!storedRefreshToken) {
        return null;
      }

      const response = await axios.post(
        `${BASE_API_URL}/auth/refresh-token`,
        { refreshToken: storedRefreshToken },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const newToken = response.data?.data?.token as string | undefined;
      const newRefreshToken = response.data?.data?.refreshToken as string | undefined;
      if (newToken) {
        await safeStorage.setItem('@ba_protege_jwt_token', newToken);
        if (newRefreshToken) {
          await safeStorage.setItem('@ba_protege_refresh_token', newRefreshToken);
        }
        return newToken;
      }
      return null;
    } catch {
      await safeStorage.removeItem('@ba_protege_refresh_token');
      return null;
    } finally {
      pendingRefreshPromise = null;
    }
  })();

  return pendingRefreshPromise;
}

const AUTH_NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh-token',
  '/auth/recover-password',
];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const requestUrl = String(originalRequest?.url || '');
    const isNoRefreshPath = AUTH_NO_REFRESH_PATHS.some((p) => requestUrl.includes(p));

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isNoRefreshPath
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Proveedor de tiempo confiable para protección anti-manipulación
export const timestampProvider = {
  now: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/health', { timeout: 4000 });
      if (response.data?.timestamp) {
        return new Date(response.data.timestamp).getTime();
      }
    } catch (e) {
      // Fallback local si no hay conectividad
    }
    return Date.now();
  },
};

export const getReliableTimestamp = async (): Promise<number> => {
  return timestampProvider.now();
};
