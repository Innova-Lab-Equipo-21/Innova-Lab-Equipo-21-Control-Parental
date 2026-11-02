import { ProtectionStatus } from '@prisma/client';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { prisma } from '../config/database.js';

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
}

export const metricsService = new MetricsService();
