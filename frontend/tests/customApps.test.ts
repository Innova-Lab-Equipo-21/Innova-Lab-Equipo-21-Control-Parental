import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service.js';

describe('Gestión y Bloqueo de Aplicaciones (Modo Responsable)', () => {
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

  test('USAGE STATS: Debe consultar las estadísticas de tiempo de uso de aplicaciones', async () => {
    const stats = await apiService.getAppUsageStats('dev-mateo-123');
    assert.ok(Array.isArray(stats));
    assert.ok(stats.length > 0);
    assert.ok(stats[0].appName);
    assert.ok(typeof stats[0].timeInMinutes === 'number');
  });
});
