// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Métricas y Actividad
// Archivo: src/services/metrics.service.ts
// Descripción: Consolida métricas reales desde PostgreSQL para el Responsable y
//              dispositivos protegidos (bloqueos, uso de apps, pasatiempos y alertas).
// ==============================================================================

import { ProtectionStatus } from '@prisma/client';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  activityStorageService,
  formatDateKey,
} from './activity-storage.service.js';

export type TimelineDay = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';
export type TimelineSource = 'all' | 'lotba' | 'custom';

export interface TimelineInput {
  userId: string;
  day?: TimelineDay;
  source?: TimelineSource;
}

interface HourBucket {
  total: number;
  lotba: number;
  custom: number;
}

const DAY_KEYS: TimelineDay[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

export class MetricsService {
  private roundTo(value: number, decimals = 1): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  private percentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  private buildGroupName(fullName?: string | null): string {
    const name = fullName?.trim();
    if (!name) return 'Mi grupo familiar';
    const parts = name.split(/\s+/);
    if (parts.length < 2) return name;
    return `Familia ${parts[parts.length - 1]}`;
  }

  private buildSummaryResponse(input: {
    groupName: string;
    activeDevices: number;
    vpnUptime: number;
    listVersion: string;
    bySource: Record<string, number>;
    totalBlocks: number;
    currentBlocks: number;
    previousBlocks: number;
  }) {
    const {
      groupName,
      activeDevices,
      vpnUptime,
      listVersion,
      bySource,
      totalBlocks,
      currentBlocks,
      previousBlocks,
    } = input;

    const labels: Record<string, string> = {
      LOTBA: 'Oficial LOTBA',
      CUSTOM: 'Personalizada',
    };
    const sourceIds = Array.from(new Set(['LOTBA', 'CUSTOM', ...Object.keys(bySource)]));

    const sources = sourceIds.map((id) => {
      const count = bySource[id] ?? 0;
      return {
        id,
        label: labels[id] ?? id,
        count,
        pct: this.percentage(count, totalBlocks),
      };
    });

    const changePercentage =
      previousBlocks > 0
        ? Math.round(((currentBlocks - previousBlocks) / previousBlocks) * 100)
        : currentBlocks > 0
          ? 100
          : 0;

    return {
      groupName,
      activeDevices,
      vpnUptime,
      listVersion,
      totalBlocks,
      changePercentage,
      sources,
    };
  }

  private getDayRange(day?: TimelineDay): { start: Date; end: Date } {
    const start = new Date();
    if (day) {
      const target = DAY_KEYS.indexOf(day);
      const diff = (start.getDay() - target + 7) % 7;
      start.setDate(start.getDate() - diff);
    }
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
  }

  private matchesSource(sourceListType: string, source: TimelineSource): boolean {
    if (source === 'all') return true;
    return sourceListType.toUpperCase() === source.toUpperCase();
  }

  private buildTimelineResponse(events: Array<{ sourceListType: string; blockedAt: Date }>) {
    const hourly: HourBucket[] = Array.from({ length: 24 }, () => ({
      total: 0,
      lotba: 0,
      custom: 0,
    }));

    for (const event of events) {
      const bucket = hourly[event.blockedAt.getHours()];
      bucket.total += 1;
      if (event.sourceListType === 'CUSTOM') bucket.custom += 1;
      if (event.sourceListType === 'LOTBA') bucket.lotba += 1;
    }

    const points = hourly.map((bucket) => bucket.total);
    const peak = Math.max(...points);

    let liveHour = new Date().getHours();
    for (let hour = hourly.length - 1; hour >= 0; hour -= 1) {
      if (hourly[hour].total > 0) {
        liveHour = hour;
        break;
      }
    }

    const live = hourly[liveHour];

    return {
      live: {
        hour: `${String(liveHour).padStart(2, '0')}:00`,
        isPeak: peak > 0 && live.total === peak,
        total: live.total,
        lotba: live.lotba,
        custom: live.custom,
      },
      points,
    };
  }

  public async getSummary(userId: string) {
    const periodMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      const devices = mockDb.devices.filter((d) => d.userId === userId);
      const activeDevices = devices.filter((d) => d.isActive);
      const activeDeviceIds = new Set(activeDevices.map((d) => d.id));
      const events = mockDb.blockedEvents.filter((e) => activeDeviceIds.has(e.deviceId));

      const bySource: Record<string, number> = {};
      for (const event of events) {
        bySource[event.sourceListType] = (bySource[event.sourceListType] ?? 0) + 1;
      }

      const vpnActiveDevices = activeDevices.filter((d) => d.status.vpnActive);
      const officialList = mockDb.blocklists.find((b) => b.type === 'OFFICIAL_LOTBA');

      return this.buildSummaryResponse({
        groupName: this.buildGroupName(user?.fullName),
        activeDevices: activeDevices.filter((d) => d.status.effectiveStatus === 'ACTIVE').length,
        vpnUptime:
          activeDevices.length > 0
            ? this.roundTo((vpnActiveDevices.length / activeDevices.length) * 100)
            : 0,
        listVersion: `v${officialList?.version ?? 1}`,
        bySource,
        totalBlocks: events.length,
        currentBlocks: events.filter((e) => e.blockedAt.getTime() >= now - periodMs).length,
        previousBlocks: events.filter(
          (e) =>
            e.blockedAt.getTime() >= now - periodMs * 2 && e.blockedAt.getTime() < now - periodMs,
        ).length,
      });
    }

    const [user, devices, officialList] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } }),
      prisma.device.findMany({
        where: { userId },
        select: {
          id: true,
          isActive: true,
          status: { select: { effectiveStatus: true, vpnActive: true } },
        },
      }),
      prisma.blocklist.findFirst({
        where: { type: 'OFFICIAL_LOTBA', isActive: true },
        orderBy: { version: 'desc' },
        select: { version: true },
      }),
    ]);

    const deviceIds = devices.map((d) => d.id);
    const activeDevices = devices.filter((d) => d.isActive);
    const activeDeviceCount = activeDevices.length;
    const vpnActiveDevices = activeDevices.filter((d) => d.status?.vpnActive);
    const periodStart = new Date(now - periodMs);
    const previousStart = new Date(now - periodMs * 2);

    const [grouped, currentBlocks, previousBlocks] = await Promise.all([
      prisma.blockedEvent.groupBy({
        by: ['sourceListType'],
        where: { deviceId: { in: deviceIds } },
        _count: { _all: true },
      }),
      prisma.blockedEvent.count({
        where: { deviceId: { in: deviceIds }, blockedAt: { gte: periodStart } },
      }),
      prisma.blockedEvent.count({
        where: {
          deviceId: { in: deviceIds },
          blockedAt: { gte: previousStart, lt: periodStart },
        },
      }),
    ]);

    const bySource: Record<string, number> = {};
    let totalBlocks = 0;
    for (const row of grouped) {
      bySource[row.sourceListType] = row._count._all;
      totalBlocks += row._count._all;
    }

    return this.buildSummaryResponse({
      groupName: this.buildGroupName(user?.fullName),
      activeDevices: activeDevices.filter(
        (d) => d.status?.effectiveStatus === ProtectionStatus.ACTIVE,
      ).length,
      vpnUptime:
        activeDeviceCount > 0
          ? this.roundTo((vpnActiveDevices.length / activeDeviceCount) * 100)
          : 0,
      listVersion: `v${officialList?.version ?? 1}`,
      bySource,
      totalBlocks,
      currentBlocks,
      previousBlocks,
    });
  }

  public async getTimeline(input: TimelineInput) {
    const source = input.source ?? 'all';
    const { start, end } = this.getDayRange(input.day);

    if (env.USE_MOCK_DATA) {
      const deviceIds = new Set(
        mockDb.devices.filter((device) => device.userId === input.userId).map((device) => device.id),
      );

      const events = mockDb.blockedEvents.filter(
        (event) =>
          deviceIds.has(event.deviceId) &&
          event.blockedAt >= start &&
          event.blockedAt < end &&
          this.matchesSource(event.sourceListType, source),
      );

      return this.buildTimelineResponse(events);
    }

    const devices = await prisma.device.findMany({
      where: { userId: input.userId },
      select: { id: true },
    });
    const deviceIds = devices.map((device) => device.id);

    const events = await prisma.blockedEvent.findMany({
      where: {
        deviceId: { in: deviceIds },
        blockedAt: { gte: start, lt: end },
        ...(source !== 'all' && { sourceListType: source.toUpperCase() }),
      },
      select: { sourceListType: true, blockedAt: true },
      orderBy: { blockedAt: 'asc' },
    });

    return this.buildTimelineResponse(events);
  }

  /**
   * Normaliza la fuente del evento de bloqueo y determina si corresponde a sitio o app.
   */
  private classifyBlockedEvent(event: {
    id: string;
    deviceId: string;
    deviceName: string;
    attemptedDomain: string;
    sourceListType: string;
    itemType?: string | null;
    blockedAt: Date;
  }) {
    const rawSource = (event.sourceListType || 'LOTBA').toUpperCase();
    const isCustom =
      rawSource === 'CUSTOM' ||
      rawSource === 'CUSTOM_APP' ||
      rawSource === 'PERSONALIZADA';
    const isApp =
      event.itemType?.toUpperCase() === 'APP' ||
      rawSource.endsWith('_APP') ||
      event.attemptedDomain.toLowerCase().includes('(app)') ||
      event.attemptedDomain.toLowerCase().startsWith('app:');

    return {
      id: event.id,
      deviceId: event.deviceId,
      deviceName: event.deviceName,
      attemptedDomain: event.attemptedDomain,
      sourceListType: isCustom ? 'CUSTOM' : 'LOTBA',
      itemType: isApp ? 'app' : 'site',
      blockedAt: event.blockedAt.toISOString(),
    };
  }

  /**
   * Devuelve el consolidado de Actividad para el Responsable:
   * - Pasatiempos de dispositivos protegidos (Menores y Adultos, con Racha y promedios)
   * - Uso diario de apps bloqueadas por dispositivo
   * - Últimos eventos bloqueados con fecha/hora exacta y tipo (sitio/app)
   */
  public async getActivityOverview(userId: string, dateKey: string = formatDateKey()) {
    let devices: Array<{
      id: string;
      deviceUuid: string;
      deviceName: string;
      childName: string | null;
      personType: 'MENOR' | 'ADULTO';
    }> = [];
    let rawBlockedEvents: Array<{
      id: string;
      deviceId: string;
      attemptedDomain: string;
      sourceListType: string;
      itemType?: string | null;
      blockedAt: Date;
    }> = [];
    let rawSecurityEvents: Array<{
      id: string;
      deviceId: string;
      eventType: string;
      description: string | null;
      occurredAt: Date;
      readAt: Date | null;
    }> = [];

    if (env.USE_MOCK_DATA) {
      const mockDevices = mockDb.devices.filter((d) => d.userId === userId);
      devices = mockDevices.map((d) => ({
        id: d.id,
        deviceUuid: d.deviceUuid,
        deviceName: d.deviceName,
        childName: d.childName || null,
        personType: d.personType?.toUpperCase() === 'ADULTO' ? 'ADULTO' : 'MENOR',
      }));
      const idSet = new Set(devices.map((d) => d.id));
      rawBlockedEvents = mockDb.blockedEvents
        .filter((e) => idSet.has(e.deviceId))
        .sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime())
        .slice(0, 100);
      rawSecurityEvents = mockDb.securityEvents
        .filter((e) => idSet.has(e.deviceId))
        .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
        .slice(0, 50)
        .map((e) => ({
          id: e.id,
          deviceId: e.deviceId,
          eventType: e.eventType,
          description: e.description || null,
          occurredAt: e.occurredAt,
          readAt: e.readAt ?? null,
        }));
    } else {
      const dbDevices = await prisma.device.findMany({
        where: { userId },
        select: {
          id: true,
          deviceUuid: true,
          deviceName: true,
          childName: true,
          personType: true,
        },
      });
      devices = dbDevices.map((d) => ({
        id: d.id,
        deviceUuid: d.deviceUuid,
        deviceName: d.deviceName,
        childName: d.childName,
        personType: d.personType === 'ADULTO' ? 'ADULTO' : 'MENOR',
      }));
      const deviceIds = devices.map((d) => d.id);
      if (deviceIds.length > 0) {
        const [dbBlocked, dbSecurity] = await Promise.all([
          prisma.blockedEvent.findMany({
            where: { deviceId: { in: deviceIds } },
            orderBy: { blockedAt: 'desc' },
            take: 100,
            select: {
              id: true,
              deviceId: true,
              attemptedDomain: true,
              sourceListType: true,
              itemType: true,
              blockedAt: true,
            },
          }),
          prisma.securityEvent.findMany({
            where: { deviceId: { in: deviceIds } },
            orderBy: { occurredAt: 'desc' },
            take: 50,
            select: {
              id: true,
              deviceId: true,
              eventType: true,
              description: true,
              occurredAt: true,
              readAt: true,
            },
          }),
        ]);
        rawBlockedEvents = dbBlocked;
        rawSecurityEvents = dbSecurity.map((ev) => ({
          id: ev.id,
          deviceId: ev.deviceId,
          eventType: String(ev.eventType),
          description: ev.description,
          occurredAt: ev.occurredAt,
          readAt: ev.readAt ?? null,
        }));
      }
    }

    const deviceIds = devices.map((d) => d.id);
    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    const [sessions, appUsage] = await Promise.all([
      activityStorageService.listPasatiempoSessions(deviceIds, 30),
      activityStorageService.listAppUsageSnapshots(deviceIds, dateKey),
    ]);

    const pasatiemposByDevice = devices.map((dev) => {
      const devSessions = sessions.filter((s) => s.deviceId === dev.id);
      const todaySessions = devSessions.filter((s) => s.dateKey === dateKey);
      const streakDays = activityStorageService.computeStreakDays(
        devSessions,
        dev.personType,
        dateKey,
      );
      const weeklyQuizAccuracyPct = activityStorageService.computeWeeklyQuizAccuracyPct(
        devSessions,
        dateKey,
      );

      return {
        deviceId: dev.id,
        deviceUuid: dev.deviceUuid,
        deviceName: dev.childName || dev.deviceName,
        profileType: dev.personType,
        streakDays,
        weeklyQuizAccuracyPct,
        today: todaySessions,
      };
    });

    const blockedEvents = rawBlockedEvents.map((ev) => {
      const dev = deviceMap.get(ev.deviceId);
      return this.classifyBlockedEvent({
        ...ev,
        deviceName: dev?.childName || dev?.deviceName || 'Dispositivo',
      });
    });

    const securityEvents = rawSecurityEvents.map((ev) => {
      const dev = deviceMap.get(ev.deviceId);
      return {
        id: ev.id,
        deviceId: ev.deviceId,
        deviceName: dev?.childName || dev?.deviceName || 'Dispositivo',
        eventType: ev.eventType,
        description: ev.description || '',
        occurredAt: ev.occurredAt.toISOString(),
        readAt: ev.readAt ? ev.readAt.toISOString() : null,
      };
    });

    return {
      dateKey,
      pasatiemposByDevice,
      appUsage,
      blockedEvents,
      securityEvents,
    };
  }

  /**
   * Marca una alerta de seguridad como leída por el Responsable.
   * Valida propiedad del dispositivo y es idempotente si ya tenía read_at.
   */
  public async markSecurityEventAsRead(userId: string, eventId: string) {
    const now = new Date();

    if (env.USE_MOCK_DATA) {
      const event = mockDb.securityEvents.find((e) => e.id === eventId);
      if (!event) {
        return { id: eventId, readAt: now.toISOString(), persisted: false };
      }
      const ownerDevice = mockDb.devices.find(
        (d) => d.id === event.deviceId && d.userId === userId,
      );
      if (!ownerDevice) {
        throw new AppError('No tenés permisos para modificar esta alerta', 403);
      }
      if (!event.readAt) {
        event.readAt = now;
      }
      return {
        id: event.id,
        readAt: event.readAt.toISOString(),
        persisted: true,
      };
    }

    const existing = await prisma.securityEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        readAt: true,
        device: { select: { userId: true } },
      },
    });

    if (!existing) {
      return { id: eventId, readAt: now.toISOString(), persisted: false };
    }

    if (existing.device.userId !== userId) {
      throw new AppError('No tenés permisos para modificar esta alerta', 403);
    }

    if (existing.readAt) {
      return {
        id: existing.id,
        readAt: existing.readAt.toISOString(),
        persisted: true,
      };
    }

    const updated = await prisma.securityEvent.update({
      where: { id: existing.id },
      data: { readAt: now },
      select: { id: true, readAt: true },
    });

    return {
      id: updated.id,
      readAt: (updated.readAt ?? now).toISOString(),
      persisted: true,
    };
  }

  /**
   * Devuelve métricas de Actividad específicas de un dispositivo protegido (Adulto o Menor),
   * incluyendo pasatiempos, uso diario de apps, eventos bloqueados y alertas de seguridad reales.
   */
  public async getDeviceActivity(deviceUuid: string, dateKey: string = formatDateKey()) {
    let device: {
      id: string;
      deviceUuid: string;
      deviceName: string;
      childName: string | null;
      personType: 'MENOR' | 'ADULTO';
    } | null = null;
    let rawBlockedEvents: Array<{
      id: string;
      deviceId: string;
      attemptedDomain: string;
      sourceListType: string;
      itemType?: string | null;
      blockedAt: Date;
    }> = [];
    let rawSecurityEvents: Array<{
      id: string;
      deviceId: string;
      eventType: string;
      description: string | null;
      occurredAt: Date;
      readAt: Date | null;
    }> = [];

    if (env.USE_MOCK_DATA) {
      const found = mockDb.devices.find(
        (d) => d.deviceUuid === deviceUuid || d.id === deviceUuid,
      );
      if (found) {
        device = {
          id: found.id,
          deviceUuid: found.deviceUuid,
          deviceName: found.deviceName,
          childName: found.childName || null,
          personType: found.personType?.toUpperCase() === 'ADULTO' ? 'ADULTO' : 'MENOR',
        };
        rawBlockedEvents = mockDb.blockedEvents
          .filter((e) => e.deviceId === found.id)
          .sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime())
          .slice(0, 50);
        rawSecurityEvents = mockDb.securityEvents
          .filter((e) => e.deviceId === found.id)
          .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
          .slice(0, 50)
          .map((e) => ({
            id: e.id,
            deviceId: e.deviceId,
            eventType: e.eventType,
            description: e.description || null,
            occurredAt: e.occurredAt,
            readAt: e.readAt ?? null,
          }));
      }
    } else {
      const found = await prisma.device.findFirst({
        where: { OR: [{ deviceUuid }, { id: deviceUuid }] },
        select: {
          id: true,
          deviceUuid: true,
          deviceName: true,
          childName: true,
          personType: true,
        },
      });
      if (!found) {
        throw new AppError('Dispositivo no encontrado', 404);
      }
      device = {
        id: found.id,
        deviceUuid: found.deviceUuid,
        deviceName: found.deviceName,
        childName: found.childName,
        personType: found.personType === 'ADULTO' ? 'ADULTO' : 'MENOR',
      };
      const [dbBlocked, dbSecurity] = await Promise.all([
        prisma.blockedEvent.findMany({
          where: { deviceId: found.id },
          orderBy: { blockedAt: 'desc' },
          take: 50,
          select: {
            id: true,
            deviceId: true,
            attemptedDomain: true,
            sourceListType: true,
            itemType: true,
            blockedAt: true,
          },
        }),
        prisma.securityEvent.findMany({
          where: { deviceId: found.id },
          orderBy: { occurredAt: 'desc' },
          take: 50,
          select: {
            id: true,
            deviceId: true,
            eventType: true,
            description: true,
            occurredAt: true,
            readAt: true,
          },
        }),
      ]);
      rawBlockedEvents = dbBlocked;
      rawSecurityEvents = dbSecurity.map((ev) => ({
        id: ev.id,
        deviceId: ev.deviceId,
        eventType: String(ev.eventType),
        description: ev.description,
        occurredAt: ev.occurredAt,
        readAt: ev.readAt ?? null,
      }));
    }

    const resolvedId = device?.id || deviceUuid;
    const profileType: 'MENOR' | 'ADULTO' = device?.personType || 'MENOR';
    const resolvedName = device?.childName || device?.deviceName || 'Mi dispositivo';

    const [sessions, appUsage] = await Promise.all([
      activityStorageService.listPasatiempoSessions([resolvedId], 30),
      activityStorageService.listAppUsageSnapshots([resolvedId], dateKey),
    ]);

    const todaySessions = sessions.filter((s) => s.dateKey === dateKey);
    const streakDays = activityStorageService.computeStreakDays(sessions, profileType, dateKey);
    const weeklyQuizAccuracyPct = activityStorageService.computeWeeklyQuizAccuracyPct(
      sessions,
      dateKey,
    );

    const blockedEvents = rawBlockedEvents.map((ev) =>
      this.classifyBlockedEvent({
        ...ev,
        deviceName: resolvedName,
      }),
    );

    const securityEvents = rawSecurityEvents.map((ev) => ({
      id: ev.id,
      deviceId: ev.deviceId,
      deviceName: resolvedName,
      eventType: ev.eventType,
      description: ev.description || '',
      occurredAt: ev.occurredAt.toISOString(),
      readAt: ev.readAt ? ev.readAt.toISOString() : null,
    }));

    return {
      dateKey,
      deviceId: resolvedId,
      profileType,
      pasatiempos: {
        today: todaySessions,
        streakDays,
        weeklyQuizAccuracyPct,
      },
      appUsage,
      blockedEvents,
      securityEvents,
    };
  }
}

export const metricsService = new MetricsService();
