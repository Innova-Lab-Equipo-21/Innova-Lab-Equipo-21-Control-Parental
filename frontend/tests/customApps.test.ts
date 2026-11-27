// ==============================================================================
// Proyecto: BA Protege+
// Componente: Pruebas Automatizadas — Gestión y Bloqueo de Aplicaciones
// Archivo: tests/customApps.test.ts
// Descripción: Valida CRUD de aplicaciones bloqueadas, límites por dispositivo y uso real vía REST.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service.js';
import { installBlocklistApiStub } from './helpers/blocklistApiStub.js';

describe('Gestión y Bloqueo de Aplicaciones (Modo Responsable)', () => {
  let stub: ReturnType<typeof installBlocklistApiStub>;

  before(async () => {
    stub = installBlocklistApiStub();
    await stub.reset();
    stub.state.usageByDevice.set('dev-real-123', [
      {
        id: 'snap-1',
        appName: 'TikTok',
        packageName: 'com.zhiliaoapp.musically',
        usedMinutes: 25,
        dailyLimitMinutes: 60,
        isBlocked: false,
      },
    ]);
  });

  after(() => {
    stub.restore();
  });

  test('GET: Debe obtener la lista de aplicaciones bloqueadas inicial', async () => {
    const res = await apiService.getCustomBlocklist();
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.ok(Array.isArray(res.data.apps));
  });

  test('CREATE: Debe permitir agregar una nueva aplicación a la lista de bloqueados', async () => {
    const appName = 'Casino Royale App';
    const packageName = `com.casino.royale.${Date.now()}`;
    const category = 'Apuestas';

    const res = await apiService.addCustomBlockedApp(
      appName,
      packageName,
      category,
      true,
      []
    );

    assert.equal(res.success, true);
    assert.equal(res.data.appName, appName);
    assert.equal(res.data.packageName, packageName);
    assert.equal(res.data.category, category);
    assert.equal(res.data.isActive, true);
    assert.equal(res.data.applyToAll, true);
    assert.ok(res.data.id);

    // Verificar presencia en la lista
    const listRes = await apiService.getCustomBlocklist();
    assert.ok(listRes.data.apps?.some((a) => a.id === res.data.id));
  });

  test('CREATE: Debe rechazar la adición de aplicaciones repetidas / duplicadas', async () => {
    const appName = `AppRepetidaTest_${Date.now()}`;
    const packageName = `com.app.repetida.${Date.now()}`;

    await apiService.addCustomBlockedApp(appName, packageName, 'Juegos', true, []);

    // Intentar agregar la misma aplicación por nombre
    await assert.rejects(
      async () => {
        await apiService.addCustomBlockedApp(
          `  ${appName.toUpperCase()}  `,
          `com.otro.pkg.${Date.now()}`,
          'Juegos',
          true,
          []
        );
      },
      (err: any) => {
        return err instanceof Error && /ya se encuentra en tu lista de restricción/i.test(err.message);
      }
    );

    // Intentar agregar la misma aplicación por packageName
    await assert.rejects(
      async () => {
        await apiService.addCustomBlockedApp(
          `NombreDistinto_${Date.now()}`,
          packageName,
          'Juegos',
          true,
          []
        );
      },
      (err: any) => {
        return err instanceof Error && /ya se encuentra en tu lista de restricción/i.test(err.message);
      }
    );
  });

  test('CREATE: Debe permitir configurar regla de aplicación restringida a dispositivos específicos', async () => {
    const appName = 'TikTok Test';
    const packageName = `com.tiktok.test.${Date.now()}`;
    const targetDevices = ['dev-mateo-123'];

    const res = await apiService.addCustomBlockedApp(
      appName,
      packageName,
      'Redes sociales',
      false,
      targetDevices
    );

    assert.equal(res.success, true);
    assert.equal(res.data.applyToAll, false);
    assert.deepEqual(res.data.deviceIds, targetDevices);
  });

  test('DEVICE LIMITS: Debe permitir configurar límites de tiempo diarios específicos por dispositivo con fallback a Bloqueo total', async () => {
    const appName = 'Instagram Limit Test';
    const packageName = `com.instagram.test.${Date.now()}`;
    const deviceIds = ['self', 'dev-mateo-123', 'dev-sofia-456'];
    const deviceLimits = {
      self: undefined, // Bloqueo total
      'dev-mateo-123': 60, // 1 hora
      'dev-sofia-456': 300, // 5 horas
    };

    const res = await apiService.addCustomBlockedApp(
      appName,
      packageName,
      'Redes sociales',
      false,
      deviceIds,
      undefined,
      deviceLimits
    );

    assert.equal(res.success, true);
    assert.deepEqual(res.data.deviceLimits, deviceLimits);
    assert.equal(res.data.deviceLimits?.['self'], undefined);
    assert.equal(res.data.deviceLimits?.['dev-mateo-123'], 60);
    assert.equal(res.data.deviceLimits?.['dev-sofia-456'], 300);
  });

  test('UPDATE: Debe permitir pausar y reanudar el bloqueo de una aplicación (isActive)', async () => {
    const appName = `App Toggle ${Date.now()}`;
    const created = await apiService.addCustomBlockedApp(
      appName,
      `com.toggle.${Date.now()}`,
      'Juegos'
    );

    // Pausar
    const pauseRes = await apiService.updateCustomBlockedApp(created.data.id, {
      isActive: false,
    });
    assert.equal(pauseRes.data.isActive, false);

    // Reanudar
    const resumeRes = await apiService.updateCustomBlockedApp(created.data.id, {
      isActive: true,
    });
    assert.equal(resumeRes.data.isActive, true);
  });

  test('DELETE: Debe permitir eliminar una aplicación de la lista de bloqueadas', async () => {
    const appName = `App Eliminar ${Date.now()}`;
    const created = await apiService.addCustomBlockedApp(
      appName,
      `com.delete.${Date.now()}`,
      'Personalizado'
    );

    const delRes = await apiService.deleteCustomBlockedApp(created.data.id);
    assert.equal(delRes.success, true);

    const listRes = await apiService.getCustomBlocklist();
    assert.ok(!listRes.data.apps?.some((a) => a.id === created.data.id));
  });

  test('UPDATE: Debe permitir modificar los límites de tiempo diarios específicos por dispositivo', async () => {
    const appName = `App Edit Limits ${Date.now()}`;
    const created = await apiService.addCustomBlockedApp(
      appName,
      `com.editlimits.${Date.now()}`,
      'Redes sociales',
      false,
      ['self', 'dev-1'],
      undefined,
      { self: undefined, 'dev-1': 30 }
    );

    // Modificar límites por dispositivo
    const updated = await apiService.updateCustomBlockedApp(created.data.id, {
      deviceLimits: {
        self: 120, // Actualizado a 2 horas
        'dev-1': undefined, // Actualizado a Bloqueo total
      },
    });

    assert.equal(updated.success, true);
    assert.equal(updated.data.deviceLimits?.['self'], 120);
    assert.equal(updated.data.deviceLimits?.['dev-1'], undefined);
  });

  test('USAGE STATS: Debe consultar las estadísticas reales de tiempo de uso desde el backend', async () => {
    const stats = await apiService.getAppUsageStats('dev-real-123');
    assert.ok(Array.isArray(stats));
    assert.equal(stats.length, 1);
    assert.equal(stats[0].appName, 'TikTok');
    assert.equal(stats[0].timeInMinutes, 25);

    const emptyStats = await apiService.getAppUsageStats('dev-sin-uso');
    assert.deepEqual(emptyStats, []);
  });
});
