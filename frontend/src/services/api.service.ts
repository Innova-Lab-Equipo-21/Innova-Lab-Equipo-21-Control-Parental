// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (API Client)
// Archivo: src/services/api.service.ts
// Descripción: Cliente HTTP para comunicación con el backend REST de BA Protege+.
// ==============================================================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base para el entorno de desarrollo (10.0.2.2 apunta al localhost del host en el emulador Android)
export const BASE_API_URL = 'http://10.0.2.2:3000/api';

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT si está guardado en sesión
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@ba_protege_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // --------------------------------------------------------------------------
  // Autenticación de Responsable
  // --------------------------------------------------------------------------
  async register(data: { email: string; password: string; fullName: string }) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.data?.token) {
      await AsyncStorage.setItem('@ba_protege_jwt_token', response.data.data.token);
    }
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('@ba_protege_jwt_token');
  },

  // --------------------------------------------------------------------------
  // Pareamiento y Dispositivos
  // --------------------------------------------------------------------------
  async generatePairingCode() {
    const response = await apiClient.post('/devices/pair/generate');
    return response.data;
  },

  async confirmPairing(data: {
    pairingCode: string;
    deviceUuid: string;
    deviceName: string;
    childName?: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
  }) {
    const response = await apiClient.post('/devices/pair/confirm', data);
    return response.data;
  },

  async listDevices() {
    const response = await apiClient.get('/devices');
    return response.data;
  },

  async getDeviceDetail(deviceId: string) {
    const response = await apiClient.get(`/devices/${deviceId}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Listas de Bloqueo
  // --------------------------------------------------------------------------
  async getOfficialLotbaList() {
    const response = await apiClient.get('/blocklist/official');
    return response.data;
  },

  async getDeviceBlocklist(deviceUuid: string) {
    const response = await apiClient.get(`/blocklist/device/${deviceUuid}`);
    return response.data;
  },

  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat
  // --------------------------------------------------------------------------
  async sendHeartbeat(data: {
    deviceUuid: string;
    vpnActive: boolean;
    permissionsOk: boolean;
    batteryLevel?: number;
    isCharging?: boolean;
    blocklistVersion: number;
    appVersion?: string;
  }) {
    const response = await apiClient.post('/telemetry/heartbeat', data);
    return response.data;
  },

  async reportBlockedEvent(data: {
    deviceUuid: string;
    attemptedDomain: string;
    sourceListType?: string;
  }) {
    const response = await apiClient.post('/telemetry/events/blocked', data);
    return response.data;
  },

  async reportSecurityEvent(data: {
    deviceUuid: string;
    eventType: string;
    description?: string;
  }) {
    const response = await apiClient.post('/telemetry/events/security', data);
    return response.data;
  },
};
