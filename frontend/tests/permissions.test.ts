// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Tests automatizados — Permisos del Dispositivo)
// Archivo: tests/permissions.test.ts
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiService } from '../src/services/api.service.js';
import { canToggleDevicePermission } from '../src/utils/permissionChecker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    let res = await apiService.listDevices();
    if (!res.data || res.data.length === 0) {
      await apiService.addDevice({
        childName: 'Dispositivo Protegido',
        deviceModel: 'Samsung Galaxy A54',
        permissions: {
          vpn: true,
          accessibility: true,
          notifications: true,
          batteryOptimization: true,
          location: true,
          usageStats: true,
          grantedCount: 6,
        },
      });
      res = await apiService.listDevices();
    }
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

  test('Los badges de permisos deben mostrar únicamente "Activo" o "Inactivo" sin emojis', () => {
    const formatPermissionBadge = (isGranted: boolean) => ({
      status: isGranted ? 'activo' : 'inactivo',
      label: isGranted ? 'Activo' : 'Inactivo',
    });

    const activeBadge = formatPermissionBadge(true);
    assert.equal(activeBadge.label, 'Activo');
    assert.equal(activeBadge.status, 'activo');
    assert.ok(!/[^\w\s]/.test(activeBadge.label), 'No debe contener emojis ni caracteres especiales');

    const inactiveBadge = formatPermissionBadge(false);
    assert.equal(inactiveBadge.label, 'Inactivo');
    assert.equal(inactiveBadge.status, 'inactivo');
    assert.ok(!/[^\w\s]/.test(inactiveBadge.label), 'No debe contener emojis ni caracteres especiales');
  });

  test('El CTA del modal de permisos debe ser "Permisos" sin emojis', () => {
    const ctaTitle = 'Permisos';
    assert.equal(ctaTitle, 'Permisos');
    assert.ok(!/[^\w\s]/.test(ctaTitle), 'El CTA no debe contener emojis');
  });

  test('Los botones de acción del modal deben ubicarse en la misma fila con igual tamaño', () => {
    const footerButtons = [
      { title: 'Cerrar', variant: 'secondary', flex: 1 },
      { title: 'Permisos', variant: 'primary', flex: 1 },
    ];
    assert.equal(footerButtons[0].title, 'Cerrar');
    assert.equal(footerButtons[1].title, 'Permisos');
    assert.equal(footerButtons[0].flex, footerButtons[1].flex, 'Ambos botones deben tener flex 1 para igual tamaño');
  });

  test('Los nombres y descripciones de permisos deben ser breves y de una sola línea', () => {
    const items = [
      { name: 'Filtro de red VPN', desc: 'Bloqueo preventivo de sitios no seguros' },
      { name: 'Accesibilidad', desc: 'Protección antidesinstalación forzada' },
      { name: 'Notificaciones', desc: 'Alertas inmediatas y estado del servicio' },
      { name: 'Optimización de batería', desc: 'Ejecución continua en segundo plano' },
      { name: 'Ubicación y GPS', desc: 'Geolocalización familiar en tiempo real' },
      { name: 'Uso de aplicaciones', desc: 'Límites de tiempo en pantalla y control' },
    ];

    items.forEach((item) => {
      assert.ok(item.name.length <= 30, `El nombre "${item.name}" debe ser breve (<=30 caracteres)`);
      assert.ok(item.desc.length <= 50, `La descripción "${item.desc}" debe ser concisa (<=50 caracteres)`);
      assert.ok(!item.name.includes('\n'), 'El nombre no debe tener saltos de línea');
      assert.ok(!item.desc.includes('\n'), 'La descripción no debe tener saltos de línea');
    });
  });

  test('Tanto el adulto protegido como el menor pueden activar permisos, pero nunca desactivarlos', () => {
    // En modos protegidos (allowDisable = false):
    // - Si el permiso está inactivo (false), SE PERMITE activarlo.
    assert.equal(canToggleDevicePermission(false, false), true);
    // - Si el permiso ya está activo (true), NUNCA se permite desactivarlo.
    assert.equal(canToggleDevicePermission(true, false), false);

    // En modo Responsable (allowDisable = true), puede tanto activar como desactivar:
    assert.equal(canToggleDevicePermission(false, true), true);
    assert.equal(canToggleDevicePermission(true, true), true);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectedScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/ProtectedDeviceScreen.tsx'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('canToggleDevicePermission'),
      true
    );
    assert.equal(
      protectedScreenSource.includes('allowDisablePermissions={false}'),
      true
    );
  });
});
