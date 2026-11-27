// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Datos Simulados / Mock Data)
// Archivo: src/config/mock-database.ts
// Descripción: Repositorio en memoria con datos mockeados para pruebas inmediatas sin base de datos.
// ==============================================================================

import bcrypt from 'bcryptjs';

// Clave por defecto para el usuario simulado: "password123"
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  fcmToken?: string;
}

export interface MockDevice {
  id: string;
  userId: string;
  deviceUuid: string;
  deviceName: string;
  childName: string;
  gender?: string;
  personType?: string;
  birthDate?: string;
  phone?: string;
  model: string;
  osVersion: string;
  appVersion: string;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  status: {
    effectiveStatus: 'ACTIVE' | 'INACTIVE' | 'PERMISSION_REQUIRED' | 'BYPASS_DETECTED' | 'UNKNOWN';
    vpnActive: boolean;
    permissionsOk: boolean;
    permissionsDetail?: {
      vpn: boolean;
      accessibility: boolean;
      notifications: boolean;
      batteryOptimization: boolean;
      location: boolean;
      usageStats: boolean;
    } | null;
    batteryLevel: number;
    isCharging: boolean;
    blocklistVersion: number;
    appVersion: string;
    lastHeartbeatAt: Date;
  };
  config: {
    protectionEnabled: boolean;
    blockGambling: boolean;
    blockCustomList: boolean;
    notifyOnBlock: boolean;
    notifyOnSecurity: boolean;
    heartbeatIntervalSec: number;
  };
}

export interface MockBlocklist {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  type: 'OFFICIAL_LOTBA' | 'CUSTOM';
  version: number;
  domains: Array<{
    id: string;
    domain: string;
    category: string;
    isActive?: boolean;
    applyToAll?: boolean;
    deviceIds?: string[];
    createdBy?: string | null;
    createdByName?: string | null;
    sourceDeviceId?: string | null;
    createdAt: Date;
  }>;
  apps?: Array<{
    id: string;
    blocklistId?: string;
    appName: string;
    packageName: string;
    category: string;
    isActive: boolean;
    applyToAll: boolean;
    deviceIds: string[];
    dailyLimitMinutes?: number | null;
    deviceLimits?: Record<string, number | undefined> | null;
    createdBy?: string | null;
    createdByName?: string | null;
    sourceDeviceId?: string | null;
    createdAt: Date;
    updatedAt?: Date;
  }>;
}

export interface MockBlockedEvent {
  id: string;
  deviceId: string;
  attemptedDomain: string;
  sourceListType: string;
  itemType?: string;
  blockedAt: Date;
}

export interface MockSecurityEvent {
  id: string;
  deviceId: string;
  eventType: string;
  description: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
  readAt?: Date | null;
}

export interface MockPairing {
  id: string;
  userId: string;
  deviceId: string | null;
  pairingCode: string;
  minor?: {
    childName: string;
    gender: string;
    personType: string;
    birthDate: string;
    phone: string;
  };
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface MockPasatiempoSession {
  id: string;
  deviceId: string;
  dateKey: string;
  gameType: 'QUIZ' | 'WORDSEARCH' | 'MEMORY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  attempts: number;
  details?: Record<string, unknown> | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAppUsageSnapshot {
  id: string;
  deviceId: string;
  dateKey: string;
  packageName: string;
  appName: string;
  usedMinutes: number;
  dailyLimitMinutes: number | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  public users: MockUser[] = [];
  public devices: MockDevice[] = [];
  public pairings: MockPairing[] = [];
  public blocklists: MockBlocklist[] = [];
  public blockedEvents: MockBlockedEvent[] = [];
  public securityEvents: MockSecurityEvent[] = [];
  public pasatiempoSessions: MockPasatiempoSession[] = [];
  public appUsageSnapshots: MockAppUsageSnapshot[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Usuario Responsable de Prueba
    const defaultUserId = 'usr-mock-tutor-001';
    this.users.push({
      id: defaultUserId,
      email: 'tutor@baprotege.gob.ar',
      fullName: 'Carlos Gutiérrez (Tutor)',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });

    // 2. Dispositivos Simulados
    const dev1Id = 'dev-mock-mateo-001';
    const dev2Id = 'dev-mock-sofia-002';
    const dev3Id = 'dev-mock-lucas-003';

    this.devices.push(
      {
        id: dev1Id,
        userId: defaultUserId,
        deviceUuid: 'uuid-samsung-mateo-a54',
        deviceName: 'Samsung Galaxy A54 (Mateo)',
        childName: 'Mateo (13 años)',
        model: 'SM-A546E',
        osVersion: 'Android 14 (API 35)',
        appVersion: '1.0.0',
        isActive: true,
        lastSeenAt: new Date(Date.now() - 30 * 1000), // Hace 30 segundos
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: {
          effectiveStatus: 'ACTIVE',
          vpnActive: true,
          permissionsOk: true,
          batteryLevel: 85,
          isCharging: false,
          blocklistVersion: 4,
          appVersion: '1.0.0',
          lastHeartbeatAt: new Date(Date.now() - 30 * 1000),
        },
        config: {
          protectionEnabled: true,
          blockGambling: true,
          blockCustomList: true,
          notifyOnBlock: true,
          notifyOnSecurity: true,
          heartbeatIntervalSec: 30,
        },
      },
      {
        id: dev2Id,
        userId: defaultUserId,
        deviceUuid: 'uuid-moto-sofia-g84',
        deviceName: 'Motorola Moto G84 (Sofía)',
        childName: 'Sofía (15 años)',
        model: 'XT2347-1',
        osVersion: 'Android 14 (API 35)',
        appVersion: '1.0.0',
        isActive: true,
        lastSeenAt: new Date(Date.now() - 50 * 1000), // Hace 50 segundos
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: {
          effectiveStatus: 'ACTIVE',
          vpnActive: true,
          permissionsOk: true,
          batteryLevel: 94,
          isCharging: true,
          blocklistVersion: 4,
          appVersion: '1.0.0',
          lastHeartbeatAt: new Date(Date.now() - 50 * 1000),
        },
        config: {
          protectionEnabled: true,
          blockGambling: true,
          blockCustomList: true,
          notifyOnBlock: true,
          notifyOnSecurity: true,
          heartbeatIntervalSec: 60,
        },
      },
      {
        id: dev3Id,
        userId: defaultUserId,
        deviceUuid: 'uuid-redmi-lucas-note13',
        deviceName: 'Xiaomi Redmi Note 13 (Lucas)',
        childName: 'Lucas (11 años)',
        model: '2312DRAABG',
        osVersion: 'Android 13 (API 33)',
        appVersion: '1.0.0',
        isActive: true,
        lastSeenAt: new Date(Date.now() - 15 * 60 * 1000), // Hace 15 minutos
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: {
          effectiveStatus: 'PERMISSION_REQUIRED',
          vpnActive: false,
          permissionsOk: false,
          batteryLevel: 42,
          isCharging: false,
          blocklistVersion: 3,
          appVersion: '1.0.0',
          lastHeartbeatAt: new Date(Date.now() - 15 * 60 * 1000),
        },
        config: {
          protectionEnabled: true,
          blockGambling: true,
          blockCustomList: false,
          notifyOnBlock: true,
          notifyOnSecurity: true,
          heartbeatIntervalSec: 60,
        },
      },
    );

    // 3. Código de Pareamiento Activo de Prueba
    this.pairings.push({
      id: 'pair-mock-001',
      userId: defaultUserId,
      deviceId: null,
      pairingCode: '483921',
      isUsed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Válido por 24h para pruebas
      createdAt: new Date(),
    });

    // 4. Lista Oficial LOTBA (Dominios No Autorizados)
    this.blocklists.push({
      id: 'list-official-lotba',
      userId: null,
      name: 'Lista Oficial LOTBA - Sitios No Autorizados',
      description: 'Registro de dominios de juego clandestino y apuestas ilegales de CABA',
      type: 'OFFICIAL_LOTBA',
      version: 4,
      domains: [
        {
          id: 'dom-1',
          domain: 'apuestas-online-ilegal.bet',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-2',
          domain: 'casino-sin-licencia.com',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-3',
          domain: 'juegos-azar-clandestino.net',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-4',
          domain: 'slot-virtual-no-autorizado.xyz',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-5',
          domain: 'ruleta-online-clandestina.bet',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-6',
          domain: 'poker-ilegal-argentina.com',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-7',
          domain: 'gana-facil-apuestas.top',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-8',
          domain: 'casino-directo-vip.site',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-9',
          domain: 'tragamonedas-prohibido.club',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
        {
          id: 'dom-10',
          domain: 'apuestas-deportivas-no-oficial.io',
          category: 'GAMBLING',
          createdAt: new Date(),
        },
      ],
    });

    // 5. Lista Personalizada del Responsable
    this.blocklists.push({
      id: 'list-custom-usr-001',
      userId: defaultUserId,
      name: 'Mi Lista Personalizada',
      description: 'Sitios adicionales bloqueados por el tutor',
      type: 'CUSTOM',
      version: 2,
      domains: [
        {
          id: 'custom-dom-1',
          domain: 'juegos-violentos-online.com',
          category: 'CUSTOM',
          createdAt: new Date(),
        },
        {
          id: 'custom-dom-2',
          domain: 'red-social-no-supervisada.net',
          category: 'CUSTOM',
          createdAt: new Date(),
        },
      ],
    });

    // 6. Historial de Eventos de Bloqueo
    this.blockedEvents.push(
      {
        id: 'evt-block-1',
        deviceId: dev1Id,
        attemptedDomain: 'apuestas-online-ilegal.bet',
        sourceListType: 'LOTBA',
        blockedAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        id: 'evt-block-2',
        deviceId: dev1Id,
        attemptedDomain: 'casino-sin-licencia.com',
        sourceListType: 'LOTBA',
        blockedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'evt-block-3',
        deviceId: dev1Id,
        attemptedDomain: 'juegos-azar-clandestino.net',
        sourceListType: 'LOTBA',
        blockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    );

    // 7. Eventos de Seguridad y Anti-Bypass
    this.securityEvents.push(
      {
        id: 'sec-1',
        deviceId: dev3Id,
        eventType: 'PERMISSION_REVOKED',
        description: 'Permiso de VPN o accesibilidad revocado por el usuario',
        occurredAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: 'sec-2',
        deviceId: dev1Id,
        eventType: 'DEVICE_REBOOT',
        description:
          'Dispositivo reiniciado. Protección reanudada automáticamente por BootReceiver.',
        occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    );
  }
}

export const mockDb = new MockDatabase();
