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

  test('USAGE STATS: Debe consultar las estadísticas de tiempo de uso de aplicaciones', async () => {
    const stats = await apiService.getAppUsageStats('dev-mateo-123');
    assert.ok(Array.isArray(stats));
    assert.ok(stats.length > 0);
    assert.ok(stats[0].appName);
    assert.ok(typeof stats[0].timeInMinutes === 'number');
  });
});
