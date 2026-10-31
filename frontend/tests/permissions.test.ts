// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests automatizados — Permisos del Dispositivo)
// Archivo: tests/permissions.test.ts
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service.js';

describe('Permisos del Dispositivo y Auditoría del Responsable', () => {
  const requiredPermissions = [
    { key: 'vpn', label: 'Servicio de Filtrado VPN', requiredFor: 'Filtrado de red local' },
    { key: 'accessibility', label: 'Servicio de Accesibilidad', requiredFor: 'Protección antidesinstalación' },
    { key: 'notifications', label: 'Notificaciones del Sistema', requiredFor: 'Alertas en primer plano' },
    { key: 'batteryOptimization', label: 'Sin Optimización de Batería', requiredFor: 'Ejecución en segundo plano' },
    { key: 'location', label: 'Geolocalización Segura', requiredFor: 'Ubicación del dispositivo' },
    { key: 'usageStats', label: 'Acceso al Uso de Aplicaciones', requiredFor: 'Límites de tiempo de pantalla' },
  ];

  test('Debe requerir exactamente los 6 permisos clave del sistema Android', () => {
    assert.equal(requiredPermissions.length, 6, 'Deben existir 6 permisos esenciales');
  });

  test('Cada permiso debe contar con clave, etiqueta y propósito pedagógico', () => {
    requiredPermissions.forEach((perm) => {
      assert.ok(perm.key, 'Debe tener clave única');
      assert.ok(perm.label, 'Debe tener etiqueta en español');
      assert.ok(perm.requiredFor, 'Debe explicar la necesidad técnica');
    });
  });

  test('El responsable debe poder consultar el estado de permisos de cada dispositivo vinculado', async () => {
    const res = await apiService.listDevices();
    assert.equal(res.success, true);
    assert.ok(res.data.length > 0, 'Debe retornar dispositivos vinculados');

    const firstDevice = res.data[0];
    assert.ok(firstDevice.permissions, 'Cada dispositivo debe contar con auditoría de permisos');
    assert.equal(typeof firstDevice.permissions.vpn, 'boolean');
    assert.equal(typeof firstDevice.permissions.accessibility, 'boolean');
    assert.equal(typeof firstDevice.permissions.notifications, 'boolean');
    assert.equal(typeof firstDevice.permissions.batteryOptimization, 'boolean');
    assert.equal(typeof firstDevice.permissions.location, 'boolean');
    assert.equal(typeof firstDevice.permissions.usageStats, 'boolean');
    assert.equal(typeof firstDevice.permissions.grantedCount, 'number');
  });

  test('El responsable debe poder auditar el estado de permisos de un dispositivo protegido', async () => {
    const res = await apiService.listDevices();
    const target = res.data[0];
    const audited = await apiService.auditDevicePermissions(target.deviceId);

    assert.equal(audited.deviceId, target.deviceId);
    assert.equal(audited.lastHeartbeat, 'Recién verificado');
    assert.ok(audited.permissions);
    assert.equal(typeof audited.permissions.grantedCount, 'number');
  });

  test('El responsable debe poder actualizar y auditar permisos específicos de un protegido', async () => {
    const res = await apiService.listDevices();
    const target = res.data[0];

    const updated = await apiService.updateDevicePermissions(target.deviceId, {
      accessibility: false,
    });

    assert.equal(updated.permissions?.accessibility, false);
    assert.equal(updated.permissions?.grantedCount, 5);

    // Restaurar a concedido
    const restored = await apiService.updateDevicePermissions(target.deviceId, {
      accessibility: true,
    });
    assert.equal(restored.permissions?.accessibility, true);
    assert.equal(restored.permissions?.grantedCount, 6);
  });
});
