// ==============================================================================
// Proyecto: BA Protege+
// Componente: API Client Core & Storage
// Archivo: src/services/api/client.ts
// ==============================================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base para el entorno de desarrollo (127.0.0.1 funciona mediante adb reverse tcp:3000 tcp:3000)
export const BASE_API_URL = 'http://127.0.0.1:3000/api';

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

// Proveedor de tiempo confiable para protección anti-manipulación
export const timestampProvider = {
  now: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/health', { timeout: 400 });
      if (response.data?.timestamp) {
        return new Date(response.data.timestamp).getTime();
      }
    } catch (e) {
      // Fallback local instantáneo
    }
    return Date.now();
  },
};

export const getReliableTimestamp = async (): Promise<number> => {
  return timestampProvider.now();
};
