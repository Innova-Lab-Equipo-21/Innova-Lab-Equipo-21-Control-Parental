// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Módulo 6 (Seguridad, Autocontrol, OTP y Permisos)
// Archivo: tests/securityModule6.test.ts
// Descripción: Verifica la eliminación de fallbacks offline/mock en Autocontrol y
//              Antidesinstalación OTP, la hidratación granular de los 6 permisos desde
//              PostgreSQL y la sincronización de heartbeats desde PermissionsScreen.
// ==============================================================================

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { apiService } from '../src/services/api.service.js';
import { apiClient, safeStorage } from '../src/services/api/client.js';

describe('Módulo 6 — Segurança, Autocontrol, Antidesinstalação OTP e Permissões Reais', () => {
  const originalGet = apiClient.get.bind(apiClient);
  const originalPost = apiClient.post.bind(apiClient);

  afterEach(() => {
    (apiClient as any).get = originalGet;
    (apiClient as any).post = originalPost;
    safeStorage.clearMemory();
  });

  test('1. enableSelfControl y disableSelfControl NO hacen fallback offline silencioso cuando falla el backend', async () => {
    (apiClient as any).post = async () => {
      throw new Error('Network Error');
    };

    await assert.rejects(
      async () => {
        await apiService.enableSelfControl();
      },
      /Network Error|No se pudo activar la autoprotección/i
    );

    // No debe haber guardado estado activo falso en caché
    assert.equal(await safeStorage.getItem('@ba_protege_self_control_active'), null);

    await assert.rejects(
      async () => {
        await apiService.disableSelfControl();
      },
      /Network Error|No se pudo desactivar la autoprotección/i
    );
  });

  test('2. getSelfControlStatus usa PostgreSQL como fuente de verdad y solo lee caché local si no hay red', async () => {
    const enabledAtIso = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const canDisableAtIso = new Date(Date.now() + 22 * 3600 * 1000).toISOString();

    (apiClient as any).get = async (url: string) => {
      assert.equal(url, '/self-control/status');
      return {
        data: {
          success: true,
          data: {
            active: true,
            status: 'ACTIVE_LOCKED',
            enabledAt: enabledAtIso,
            canDisableAt: canDisableAtIso,
            canDisable: false,
            remainingHours: 22,
            remainingMinutes: 0,
            remainingSeconds: 0,
          },
        },
      };
    };

    const onlineStatus = await apiService.getSelfControlStatus();
    assert.equal(onlineStatus.active, true);
    assert.equal(onlineStatus.status, 'ACTIVE_LOCKED');
    assert.equal(onlineStatus.remainingHours, 22);

    // Simular corte total de red (!err.response): debe mantener lectura de caché
    (apiClient as any).get = async () => {
      throw new Error('Network Error');
    };
    const offlineStatus = await apiService.getSelfControlStatus();
    assert.equal(offlineStatus.active, true);
    assert.equal(offlineStatus.status, 'ACTIVE_LOCKED');
  });

  test('3. requestAntiUninstallCode y verifyAntiUninstallCode NO generan códigos offline ni usan tutor@baprotege.gob.ar', async () => {
    (apiClient as any).post = async () => {
      const err: any = new Error('Server unreachable');
      err.response = {
        status: 404,
        data: {
          message:
            'No se encontró un responsable vinculado con correo válido para este dispositivo.',
        },
      };
      throw err;
    };

    await assert.rejects(
      async () => {
        await apiService.requestAntiUninstallCode('uuid-inexistente');
      },
      /responsable vinculado/i
    );

    await assert.rejects(
      async () => {
        await apiService.verifyAntiUninstallCode('uuid-inexistente', '123456');
      },
      /responsable vinculado|código/i
    );

    const devicesApiSource = fs.readFileSync(
      path.resolve(__dirname, '../src/services/api/devices.api.ts'),
      'utf8'
    );
    const hookSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/hooks/useAntiUninstallProtection.ts'
      ),
      'utf8'
    );

    assert.equal(devicesApiSource.includes('tutor@baprotege.gob.ar'), false);
    assert.equal(hookSource.includes('t***r@baprotege.gob.ar'), false);
  });

  test('4. listDevices hidrata de forma granular los 6 permisos individuales desde status.permissionsDetail', async () => {
    (apiClient as any).get = async (url: string) => {
      assert.equal(url, '/devices');
      return {
        data: {
          success: true,
          data: [
            {
              id: 'dev-perm-1',
              deviceUuid: 'uuid-perm-1',
              childName: 'Mateo',
              personType: 'MENOR',
              status: {
                effectiveStatus: 'PERMISSION_REQUIRED',
                vpnActive: true,
                permissionsOk: false,
                permissionsDetail: {
                  vpn: true,
                  accessibility: true,
                  notifications: true,
                  batteryOptimization: false,
                  location: true,
                  usageStats: false,
                },
              },
            },
          ],
        },
      };
    };

    const res = await apiService.listDevices();
    assert.equal(res.data.length, 1);
    const perms = res.data[0].permissions!;
    assert.equal(perms.vpn, true);
    assert.equal(perms.accessibility, true);
    assert.equal(perms.notifications, true);
    assert.equal(perms.batteryOptimization, false);
    assert.equal(perms.location, true);
    assert.equal(perms.usageStats, false);
    assert.equal(perms.grantedCount, 4);
  });

  test('5. PermissionsScreen sincroniza sendRealDeviceHeartbeat al conceder o revocar permisos en dispositivo protegido', () => {
    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('syncProtectedHeartbeatIfNeeded'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.sendRealDeviceHeartbeat(userId)'),
      true
    );
  });
});
