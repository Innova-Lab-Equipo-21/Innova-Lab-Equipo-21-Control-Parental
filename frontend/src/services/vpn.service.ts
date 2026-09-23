// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Bridge Service)
// Archivo: src/services/vpn.service.ts
// Descripción: Servicio TypeScript que interactúa con el módulo nativo Android (ProtectionModule).
// ==============================================================================

import { NativeModules, Platform } from 'react-native';
import { NativeBlocklistInfo } from '../types';

const { ProtectionModule } = NativeModules;

class VpnServiceBridge {
  /**
   * Solicita al sistema Android autorización para crear la conexión VPN local.
   */
  public async prepareVpn(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      console.warn('ProtectionModule no disponible en esta plataforma.');
      return true;
    }
    return ProtectionModule.prepareVpn();
  }

  /**
   * Inicia el servicio VPN local de bloqueo de dominios.
   */
  public async startProtection(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      console.warn('Modo simulado: Protección iniciada en plataforma no Android.');
      return true;
    }
    return ProtectionModule.startProtection();
  }

  /**
   * Detiene el servicio VPN local.
   */
  public async stopProtection(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      console.warn('Modo simulado: Protección detenida en plataforma no Android.');
      return true;
    }
    return ProtectionModule.stopProtection();
  }

  /**
   * Consulta el estado de ejecución real del motor VPN nativo.
   */
  public async isProtectionActive(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return false;
    }
    return ProtectionModule.isProtectionActive();
  }

  /**
   * Actualiza los dominios bloqueados en la memoria y caché persistente de Android.
   */
  public async updateBlocklist(version: number, domains: string[]): Promise<NativeBlocklistInfo> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return { version, totalDomains: domains.length };
    }
    return ProtectionModule.updateBlocklist(version, domains);
  }

  /**
   * Obtiene la versión actual y cantidad de dominios en la lista local.
   */
  public async getBlocklistInfo(): Promise<NativeBlocklistInfo> {
    if (Platform.OS !== 'android' || !ProtectionModule) {
      return { version: 1, totalDomains: 4 };
    }
    return ProtectionModule.getBlocklistInfo();
  }
}

export const vpnServiceBridge = new VpnServiceBridge();
