// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Servicio de Autoprotección (SelfControl)
// Archivo: src/services/selfControl.service.ts
// Descripción: Gestiona el estado persistente de autoprotección del responsable
//              en PostgreSQL (tabla users) con bloqueo obligatorio de 24 horas.
// ==============================================================================

import { prisma } from '../config/database.js';
import { env } from '../config/environment.js';
import { mockDb } from '../config/mock-database.js';
import { AppError } from '../middlewares/error.middleware.js';

export const SELF_CONTROL_LOCK_HOURS = 24;
const LOCK_MS = SELF_CONTROL_LOCK_HOURS * 60 * 60 * 1000;

export interface SelfControlStatusDTO {
  active: boolean;
  status: 'INACTIVE' | 'ACTIVE_LOCKED' | 'DEACTIVATION_READY';
  enabledAt: string | null;
  deactivationRequestedAt: string | null;
  deactivationAvailableAt: string | null;
  canDisableAt: string | null;
  canDisable: boolean;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  serverTime: string;
}

function buildStatus(
  active: boolean,
  enabledAtDate: Date | null,
  deactivationRequestedAtDate: Date | null,
): SelfControlStatusDTO {
  const now = new Date();

  if (!active || !enabledAtDate) {
    return {
      active: false,
      status: 'INACTIVE',
      enabledAt: null,
      deactivationRequestedAt: null,
      deactivationAvailableAt: null,
      canDisableAt: null,
      canDisable: true,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      serverTime: now.toISOString(),
    };
  }

  const canDisableAtDate = new Date(enabledAtDate.getTime() + LOCK_MS);
  const remainingMs = canDisableAtDate.getTime() - now.getTime();

  if (remainingMs > 0) {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const remainingHours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    return {
      active: true,
      status: 'ACTIVE_LOCKED',
      enabledAt: enabledAtDate.toISOString(),
      deactivationRequestedAt: deactivationRequestedAtDate
        ? deactivationRequestedAtDate.toISOString()
        : null,
      deactivationAvailableAt: canDisableAtDate.toISOString(),
      canDisableAt: canDisableAtDate.toISOString(),
      canDisable: false,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
      serverTime: now.toISOString(),
    };
  }

  return {
    active: true,
    status: 'DEACTIVATION_READY',
    enabledAt: enabledAtDate.toISOString(),
    deactivationRequestedAt: deactivationRequestedAtDate
      ? deactivationRequestedAtDate.toISOString()
      : null,
    deactivationAvailableAt: canDisableAtDate.toISOString(),
    canDisableAt: canDisableAtDate.toISOString(),
    canDisable: true,
    remainingHours: 0,
    remainingMinutes: 0,
    remainingSeconds: 0,
    serverTime: now.toISOString(),
  };
}

export class SelfControlService {
  private mockState = new Map<
    string,
    { active: boolean; enabledAt: Date | null; deactivationRequestedAt: Date | null }
  >();

  public async getStatus(userId: string): Promise<SelfControlStatusDTO> {
    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      if (!user) throw new AppError('Usuario no encontrado', 404);
      const state = this.mockState.get(userId) || {
        active: false,
        enabledAt: null,
        deactivationRequestedAt: null,
      };
      return buildStatus(state.active, state.enabledAt, state.deactivationRequestedAt);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        selfControlActive: true,
        selfControlEnabledAt: true,
        deactivationRequestedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return buildStatus(
      user.selfControlActive,
      user.selfControlEnabledAt,
      user.deactivationRequestedAt,
    );
  }

  public async enable(userId: string): Promise<SelfControlStatusDTO> {
    const now = new Date();

    if (env.USE_MOCK_DATA) {
      const user = mockDb.users.find((u) => u.id === userId);
      if (!user) throw new AppError('Usuario no encontrado', 404);
      this.mockState.set(userId, {
        active: true,
        enabledAt: now,
        deactivationRequestedAt: null,
      });
      return buildStatus(true, now, null);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        selfControlActive: true,
        selfControlEnabledAt: now,
        deactivationRequestedAt: null,
      },
      select: {
        selfControlActive: true,
        selfControlEnabledAt: true,
        deactivationRequestedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ENABLE_SELF_CONTROL',
        details: { enabledAt: now.toISOString() },
      },
    });

    return buildStatus(
      updated.selfControlActive,
      updated.selfControlEnabledAt,
      updated.deactivationRequestedAt,
    );
  }

  public async disable(userId: string): Promise<SelfControlStatusDTO> {
    const current = await this.getStatus(userId);

    if (current.active && !current.canDisable) {
      const waitText = `${current.remainingHours}h ${current.remainingMinutes.toString().padStart(2, '0')}m`;
      throw new AppError(
        `La desactivación no está permitida durante el período de protección obligatoria de ${SELF_CONTROL_LOCK_HOURS} horas. Tiempo restante: ${waitText}.`,
        409,
      );
    }

    if (env.USE_MOCK_DATA) {
      this.mockState.set(userId, {
        active: false,
        enabledAt: null,
        deactivationRequestedAt: null,
      });
      return buildStatus(false, null, null);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        selfControlActive: false,
        selfControlEnabledAt: null,
        deactivationRequestedAt: null,
      },
      select: {
        selfControlActive: true,
        selfControlEnabledAt: true,
        deactivationRequestedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DISABLE_SELF_CONTROL',
        details: { disabledAt: new Date().toISOString() },
      },
    });

    return buildStatus(
      updated.selfControlActive,
      updated.selfControlEnabledAt,
      updated.deactivationRequestedAt,
    );
  }
}

export const selfControlService = new SelfControlService();
