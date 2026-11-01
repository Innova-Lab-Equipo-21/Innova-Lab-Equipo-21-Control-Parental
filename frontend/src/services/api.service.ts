// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (API Service Facade)
// Archivo: src/services/api.service.ts
// Descripción: Fachada unificada y modularizada para la comunicación con el backend REST
//              de BA Protege+, delegando a submódulos especializados por dominio:
//              - client: Cliente Axios, almacenamiento seguro y tiempo confiable
//              - authApi: Registro, login, recuperación de contraseña y logout
//              - devicesApi: Pareamiento, auditoría de permisos y gestión de dispositivos
//              - selfControlApi: Autocontrol de 24hs con temporizador y pase temporal
//              - blocklistApi: Listas LOTBA, dominios bloqueados, apps y estadísticas
//              - telemetryApi: Heartbeats, telemetría y geolocalización híbrida
// ==============================================================================

import {
  BASE_API_URL,
  timestampProvider,
  authApi,
  devicesApi,
  selfControlApi,
  blocklistApi,
  telemetryApi,
} from './api';

export {
  BASE_API_URL,
  authApi,
  devicesApi,
  selfControlApi,
  blocklistApi,
  telemetryApi,
};

export const apiService = {
  // --------------------------------------------------------------------------
  // Protección Anti-Manipulación de Hora (Server / Network Time)
  // --------------------------------------------------------------------------
  get getReliableTimestamp(): () => Promise<number> {
    return timestampProvider.now;
  },
  set getReliableTimestamp(fn: () => Promise<number>) {
    timestampProvider.now = fn;
  },

  // --------------------------------------------------------------------------
  // Autenticación de Responsable
  // --------------------------------------------------------------------------
  register: authApi.register.bind(authApi),
  login: authApi.login.bind(authApi),
  googleAuth: authApi.googleAuth.bind(authApi),
  googleLink: authApi.googleLink.bind(authApi),
  recoverPassword: authApi.recoverPassword.bind(authApi),
  logout: authApi.logout.bind(authApi),
  registerFcmToken: authApi.registerFcmToken.bind(authApi),

  // --------------------------------------------------------------------------
  // Pareamiento y Dispositivos (Máximo 5 dispositivos por responsable)
  // --------------------------------------------------------------------------
  generatePairingCode: devicesApi.generatePairingCode.bind(devicesApi),
  confirmPairing: devicesApi.confirmPairing.bind(devicesApi),
  getSelfDevice: devicesApi.getSelfDevice.bind(devicesApi),
  updateSelfDevice: devicesApi.updateSelfDevice.bind(devicesApi),
  listDevices: devicesApi.listDevices.bind(devicesApi),
  updateDevice: devicesApi.updateDevice.bind(devicesApi),
  addDevice: devicesApi.addDevice.bind(devicesApi),
  getDeviceDetail: devicesApi.getDeviceDetail.bind(devicesApi),
  auditDevicePermissions: devicesApi.auditDevicePermissions.bind(devicesApi),
  updateDevicePermissions: devicesApi.updateDevicePermissions.bind(devicesApi),
  unbindDevice: devicesApi.unbindDevice.bind(devicesApi),

  // --------------------------------------------------------------------------
  // Autocontrol / Autoprotección del Tutor (Temporizador de 24hs al solicitar y pase de 24hs)
  // --------------------------------------------------------------------------
  enableSelfControl: selfControlApi.enableSelfControl.bind(selfControlApi),
  requestDeactivation: selfControlApi.requestDeactivation.bind(selfControlApi),
  confirmDeactivation: selfControlApi.confirmDeactivation.bind(selfControlApi),
  disableSelfControl: selfControlApi.disableSelfControl.bind(selfControlApi),
  getSelfControlStatus: selfControlApi.getSelfControlStatus.bind(selfControlApi),
  resetSelfControl: selfControlApi.resetSelfControl.bind(selfControlApi),

  // --------------------------------------------------------------------------
  // Listas de Bloqueo y Sitios Personalizados (CRUD)
  // --------------------------------------------------------------------------
  getOfficialLotbaList: blocklistApi.getOfficialLotbaList.bind(blocklistApi),
  getDeviceBlocklist: blocklistApi.getDeviceBlocklist.bind(blocklistApi),
  getCustomBlocklist: blocklistApi.getCustomBlocklist.bind(blocklistApi),
  addCustomBlockedSite: blocklistApi.addCustomBlockedSite.bind(blocklistApi),
  updateCustomBlockedSite: blocklistApi.updateCustomBlockedSite.bind(blocklistApi),
  deleteCustomBlockedSite: blocklistApi.deleteCustomBlockedSite.bind(blocklistApi),

  // --------------------------------------------------------------------------
  // Gestión de Aplicaciones Bloqueadas y Tiempo de Uso
  // --------------------------------------------------------------------------
  addCustomBlockedApp: blocklistApi.addCustomBlockedApp.bind(blocklistApi),
  updateCustomBlockedApp: blocklistApi.updateCustomBlockedApp.bind(blocklistApi),
  deleteCustomBlockedApp: blocklistApi.deleteCustomBlockedApp.bind(blocklistApi),
  getAppUsageStats: blocklistApi.getAppUsageStats.bind(blocklistApi),

  // --------------------------------------------------------------------------
  // Telemetría y Heartbeat
  // --------------------------------------------------------------------------
  sendHeartbeat: telemetryApi.sendHeartbeat.bind(telemetryApi),
  reportBlockedEvent: telemetryApi.reportBlockedEvent.bind(telemetryApi),
  reportSecurityEvent: telemetryApi.reportSecurityEvent.bind(telemetryApi),

  // --------------------------------------------------------------------------
  // Geolocalización y Registro de Ubicación (Estrategia Híbrida GPS / IP)
  // --------------------------------------------------------------------------
  saveUserLocation: telemetryApi.saveUserLocation.bind(telemetryApi),
  getUserLocation: telemetryApi.getUserLocation.bind(telemetryApi),
};

export default apiService;
