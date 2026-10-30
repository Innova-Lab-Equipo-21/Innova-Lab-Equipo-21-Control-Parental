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
  ];

  test('Debe requerir exactamente los 4 permisos clave del sistema Android', () => {
    assert.equal(requiredPermissions.length, 4, 'Deben existir 4 permisos esenciales');
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
    assert.equal(typeof firstDevice.permissions.grantedCount, 'number');
  });
});
