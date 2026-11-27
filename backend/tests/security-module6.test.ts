// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API — Tests del Módulo 6 (Autocontrol, OTP y Permisos Granulares)
// Archivo: tests/security-module6.test.ts
// Descripción: Valida el ciclo de vida de Autoprotección 24h, códigos OTP de
//              antidesinstalación y persistencia granular de los 6 permisos vía heartbeat.
// ==============================================================================

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.USE_MOCK_DATA = 'true';

import { mockDb } from '../src/config/mock-database.js';
import { selfControlService } from '../src/services/selfControl.service.js';
import { deviceService } from '../src/services/device.service.js';
import { telemetryService } from '../src/services/telemetry.service.js';

describe('Módulo 6 Backend — Autocontrol, Antidesinstalación OTP y Permisos Granulares', () => {
  const userId = `user-mod6-${Date.now()}`;
  mockDb.users.push({
    id: userId,
    email: `mod6.${Date.now()}@test.com`,
    fullName: 'Responsable Mod6',
    isActive: true,
    createdAt: new Date(),
  });

  test('1. SelfControl: INACTIVE -> enable (ACTIVE_LOCKED 24h) -> rechaza disable 409', async () => {
    const initial = await selfControlService.getStatus(userId);
    assert.equal(initial.active, false);
    assert.equal(initial.status, 'INACTIVE');

    const enabled = await selfControlService.enable(userId);
    assert.equal(enabled.active, true);
    assert.equal(enabled.status, 'ACTIVE_LOCKED');
    assert.equal(enabled.canDisable, false);
    assert.ok(enabled.remainingHours >= 23);

    await assert.rejects(
      async () => {
        await selfControlService.disable(userId);
      },
      (err: any) => err?.statusCode === 409 && /24 horas/i.test(err?.message || ''),
    );
  });

  test('2. Permisos granulares: heartbeat actualiza y getDevicePermissions / getDevicesByUser reflejan cada uno de los 6 permisos', async () => {
    const deviceUuid = `uuid-mod6-perms-${Date.now()}`;
    const created = await deviceService.createDevice(userId, {
      childName: 'Sofía Mod6',
      profileType: 'Menor',
    });

    const paired = await deviceService.confirmPairing({
      pairingCode: created.pairingCode,
      deviceUuid,
      deviceName: 'Pixel Test',
    });

    // Conceder 4 de 6 permisos (vpn, accessibility, notifications, location = true; battery, usageStats = false)
    await telemetryService.processHeartbeat({
      deviceUuid,
      vpnActive: true,
      permissionsOk: false,
      batteryLevel: 85,
      isCharging: false,
      blocklistVersion: 1,
      permissions: {
        vpn: true,
        accessibility: true,
        notifications: true,
        batteryOptimization: false,
        location: true,
        usageStats: false,
      },
    });

    const permsRes = await deviceService.getDevicePermissions(userId, paired.deviceId);
    assert.equal(permsRes.permissions.vpn, true);
    assert.equal(permsRes.permissions.accessibility, true);
    assert.equal(permsRes.permissions.notifications, true);
    assert.equal(permsRes.permissions.batteryOptimization, false);
    assert.equal(permsRes.permissions.location, true);
    assert.equal(permsRes.permissions.usageStats, false);
    assert.equal(permsRes.permissions.grantedCount, 4);

    // Revocar vpn y accessibility -> 2 de 6
    await telemetryService.processHeartbeat({
      deviceUuid,
      vpnActive: false,
      permissionsOk: false,
      blocklistVersion: 1,
      permissions: {
        vpn: false,
        accessibility: false,
        notifications: true,
        batteryOptimization: false,
        location: true,
        usageStats: false,
      },
    });

    const afterRevoke = await deviceService.getDevicePermissions(userId, paired.deviceId);
    assert.equal(afterRevoke.permissions.vpn, false);
    assert.equal(afterRevoke.permissions.accessibility, false);
    assert.equal(afterRevoke.permissions.grantedCount, 2);

    const list = await deviceService.getDevicesByUser(userId);
    const listed = list.find((d: any) => d.id === paired.deviceId) as any;
    assert.ok(listed);
    assert.equal(listed.permissions.grantedCount, 2);
    assert.equal(listed.permissions.notifications, true);
    assert.equal(listed.permissions.location, true);
  });

  test('3. Anti-uninstall OTP: solicitar -> rechazar código inválido -> invalidar -> reemitir -> verificar y consumir', async () => {
    const deviceUuid = `uuid-mod6-otp-${Date.now()}`;
    const created = await deviceService.createDevice(userId, {
      childName: 'Lucas Mod6',
      profileType: 'Menor',
    });
    await deviceService.confirmPairing({
      pairingCode: created.pairingCode,
      deviceUuid,
      deviceName: 'Galaxy Test',
    });

    const req1 = await deviceService.requestAntiUninstallCode({ deviceUuid });
    assert.ok(req1.maskedEmail.includes('@'));
    assert.match(req1.code!, /^\d{6}$/);

    // Código erróneo rechazado
    await assert.rejects(
      async () => {
        await deviceService.verifyAntiUninstallCode({ deviceUuid, code: '000000' });
      },
      /incorrecto/i,
    );

    // Invalidación limpia el código
    await deviceService.invalidateAntiUninstallCode({ deviceUuid });
    await assert.rejects(
      async () => {
        await deviceService.verifyAntiUninstallCode({ deviceUuid, code: req1.code! });
      },
      /no hay un código activo|invalidado/i,
    );

    // Nueva solicitud reemplaza y permite verificación de un solo uso
    const req2 = await deviceService.requestAntiUninstallCode({ deviceUuid });
    const verified = await deviceService.verifyAntiUninstallCode({
      deviceUuid,
      code: req2.code!,
    });
    assert.equal(verified.success, true);

    // Reutilización rechazada
    await assert.rejects(
      async () => {
        await deviceService.verifyAntiUninstallCode({ deviceUuid, code: req2.code! });
      },
      /no hay un código activo|invalidado/i,
    );
  });
});
