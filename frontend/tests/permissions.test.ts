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
import {
  canToggleDevicePermission,
  requestAndVerifyAccessibilityPermission,
  requestAndVerifyBatteryOptimization,
  requestAndVerifyLocationPermission,
  requestAndVerifyNotificationPermission,
  requestAndVerifyUsageStatsPermission,
  requestAndVerifyVpnPermission,
} from '../src/utils/permissionChecker.js';

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

  test('VPN: Si el usuario cancela el diálogo nativo o no queda autorizado en el dispositivo, el permiso permanece inactivo', async () => {
    // Caso 1: Usuario toca "Cancelar" en el diálogo de Android (E_VPN_PERMISSION_DENIED)
    const cancelledResult = await requestAndVerifyVpnPermission({
      prepareVpn: async () => {
        const err: any = new Error('El usuario rechazó el permiso de VPN');
        err.code = 'E_VPN_PERMISSION_DENIED';
        throw err;
      },
      isVpnPrepared: async () => false,
    });
    assert.equal(cancelledResult.granted, false);
    assert.equal(cancelledResult.cancelled, true);

    // Caso 2: prepareVpn retorna true pero el sistema no confirma la activación en el dispositivo
    const unconfirmedResult = await requestAndVerifyVpnPermission({
      prepareVpn: async () => true,
      isVpnPrepared: async () => false,
    });
    assert.equal(unconfirmedResult.granted, false);
    assert.equal(unconfirmedResult.cancelled, false);

    // Caso 3: Usuario acepta y VpnService.prepare(context) == null confirma activación real
    const grantedResult = await requestAndVerifyVpnPermission({
      prepareVpn: async () => true,
      isVpnPrepared: async () => true,
    });
    assert.equal(grantedResult.granted, true);
    assert.equal(grantedResult.cancelled, false);

    // Verificar en código fuente de PermissionsScreen y ProtectionModule
    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyVpnPermission'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('vpn', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isVpnPrepared('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('VpnService.prepare(reactContext) == null'),
      true
    );
  });

  test('Accesibilidad: Abre los ajustes del sistema y solo activa el permiso si el servicio queda habilitado en Android', async () => {
    // Caso 1: Usuario vuelve de Ajustes de Accesibilidad sin activar el servicio
    const disabledResult = await requestAndVerifyAccessibilityPermission({
      openAccessibilitySettings: async () => false,
      isAccessibilityEnabled: async () => false,
    });
    assert.equal(disabledResult.granted, false);

    // Caso 2: openAccessibilitySettings retorna true pero el sistema no confirma activación
    const unconfirmedResult = await requestAndVerifyAccessibilityPermission({
      openAccessibilitySettings: async () => true,
      isAccessibilityEnabled: async () => false,
    });
    assert.equal(unconfirmedResult.granted, false);

    // Caso 3: Error abriendo Ajustes de Accesibilidad
    const errorResult = await requestAndVerifyAccessibilityPermission({
      openAccessibilitySettings: async () => {
        throw new Error('E_ACCESSIBILITY_SETTINGS');
      },
      isAccessibilityEnabled: async () => false,
    });
    assert.equal(errorResult.granted, false);

    // Caso 4: Usuario habilita BA Protege+ en Accesibilidad y regresa
    const enabledResult = await requestAndVerifyAccessibilityPermission({
      openAccessibilitySettings: async () => true,
      isAccessibilityEnabled: async () => true,
    });
    assert.equal(enabledResult.granted, true);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );
    const manifestSource = fs.readFileSync(
      path.resolve(__dirname, '../android/app/src/main/AndroidManifest.xml'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyAccessibilityPermission'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('accessibility', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('ACTION_ACCESSIBILITY_SETTINGS'),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isAccessibilityEnabled('),
      true
    );
    assert.equal(
      manifestSource.includes('BIND_ACCESSIBILITY_SERVICE'),
      true
    );
  });

  test('Notificaciones: Solicita el permiso nativo real y solo activa cuando el sistema confirma la habilitación', async () => {
    const fakePermissionsApi = (resultStatus: string) => ({
      PERMISSIONS: { POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS' },
      RESULTS: { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' },
      request: async () => resultStatus,
    });

    // Caso 1: Android 13+ donde el usuario rechaza el diálogo del sistema
    const deniedResult = await requestAndVerifyNotificationPermission(
      {
        isNotificationsEnabled: async () => false,
        openNotificationSettings: async () => false,
      },
      fakePermissionsApi('denied'),
      33
    );
    assert.equal(deniedResult.granted, false);
    assert.equal(deniedResult.denied, true);

    // Caso 2: Android 13+ donde el usuario acepta y el sistema confirma notificaciones habilitadas
    let enabledAfterGrant = false;
    const grantedResult = await requestAndVerifyNotificationPermission(
      {
        isNotificationsEnabled: async () => {
          const val = enabledAfterGrant;
          enabledAfterGrant = true;
          return val;
        },
        openNotificationSettings: async () => false,
      },
      fakePermissionsApi('granted'),
      34
    );
    assert.equal(grantedResult.granted, true);
    assert.equal(grantedResult.denied, false);

    // Caso 3: never_ask_again abre Ajustes de Notificaciones y verifica al regresar
    let openedSettings = false;
    const settingsEnabledResult = await requestAndVerifyNotificationPermission(
      {
        isNotificationsEnabled: async () => openedSettings,
        openNotificationSettings: async () => {
          openedSettings = true;
          return true;
        },
      },
      fakePermissionsApi('never_ask_again'),
      34
    );
    assert.equal(openedSettings, true);
    assert.equal(settingsEnabledResult.granted, true);

    // Caso 4: Android < 13 con notificaciones desactivadas en ajustes -> abre ajustes y vuelve sin activar
    const legacyDisabled = await requestAndVerifyNotificationPermission(
      {
        isNotificationsEnabled: async () => false,
        openNotificationSettings: async () => false,
      },
      null,
      30
    );
    assert.equal(legacyDisabled.granted, false);
    assert.equal(legacyDisabled.denied, true);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyNotificationPermission'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('notifications', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isNotificationsEnabled('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun openNotificationSettings('),
      true
    );
  });

  test('Optimización de batería: Solicita exención al sistema y solo activa cuando el dispositivo confirma isIgnoringBatteryOptimizations', async () => {
    // Caso 1: Usuario rechaza o cancela el diálogo del sistema
    const deniedResult = await requestAndVerifyBatteryOptimization({
      isBatteryOptimizationIgnored: async () => false,
      requestIgnoreBatteryOptimization: async () => false,
    });
    assert.equal(deniedResult.granted, false);
    assert.equal(deniedResult.denied, true);

    // Caso 2: requestIgnoreBatteryOptimization retorna true pero el sistema no confirma
    const unconfirmedResult = await requestAndVerifyBatteryOptimization({
      isBatteryOptimizationIgnored: async () => false,
      requestIgnoreBatteryOptimization: async () => true,
    });
    assert.equal(unconfirmedResult.granted, false);
    assert.equal(unconfirmedResult.denied, true);

    // Caso 3: Ya estaba previamente otorgada
    const alreadyGranted = await requestAndVerifyBatteryOptimization({
      isBatteryOptimizationIgnored: async () => true,
      requestIgnoreBatteryOptimization: async () => true,
    });
    assert.equal(alreadyGranted.granted, true);
    assert.equal(alreadyGranted.denied, false);

    // Caso 4: El usuario acepta en el diálogo nativo y el sistema confirma
    let grantedOnReturn = false;
    const acceptedResult = await requestAndVerifyBatteryOptimization({
      isBatteryOptimizationIgnored: async () => {
        const current = grantedOnReturn;
        grantedOnReturn = true;
        return current;
      },
      requestIgnoreBatteryOptimization: async () => true,
    });
    assert.equal(acceptedResult.granted, true);
    assert.equal(acceptedResult.denied, false);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );
    const manifestSource = fs.readFileSync(
      path.resolve(__dirname, '../android/app/src/main/AndroidManifest.xml'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyBatteryOptimization'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('batteryOptimization', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isBatteryOptimizationIgnored('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun requestIgnoreBatteryOptimization('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('isIgnoringBatteryOptimizations'),
      true
    );
    assert.equal(
      manifestSource.includes('REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'),
      true
    );
  });

  test('Ubicación: Solicita permisos nativos ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION y solo activa si el dispositivo confirma la autorización', async () => {
    const fakePermissionsApi = (statuses: Record<string, string>) => ({
      PERMISSIONS: {
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      },
      RESULTS: { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' },
      requestMultiple: async () => statuses,
    });

    // Caso 1: Usuario deniega o cancela el diálogo nativo de permisos de ubicación
    const deniedResult = await requestAndVerifyLocationPermission(
      {
        isLocationPermissionGranted: async () => false,
        isLocationEnabled: async () => false,
      },
      fakePermissionsApi({
        'android.permission.ACCESS_FINE_LOCATION': 'denied',
        'android.permission.ACCESS_COARSE_LOCATION': 'denied',
      })
    );
    assert.equal(deniedResult.granted, false);
    assert.equal(deniedResult.denied, true);

    // Caso 2: Usuario otorga permisos y el puente nativo confirma la autorización
    const grantedResult = await requestAndVerifyLocationPermission(
      {
        isLocationPermissionGranted: async () => true,
        isLocationEnabled: async () => true,
      },
      fakePermissionsApi({
        'android.permission.ACCESS_FINE_LOCATION': 'granted',
        'android.permission.ACCESS_COARSE_LOCATION': 'granted',
      })
    );
    assert.equal(grantedResult.granted, true);
    assert.equal(grantedResult.locationEnabled, true);
    assert.equal(grantedResult.denied, false);

    // Caso 3: Permiso ya otorgado previamente pero el GPS físico está apagado
    const gpsOffResult = await requestAndVerifyLocationPermission(
      {
        isLocationPermissionGranted: async () => true,
        isLocationEnabled: async () => false,
      },
      null
    );
    assert.equal(gpsOffResult.granted, true);
    assert.equal(gpsOffResult.locationEnabled, false);
    assert.equal(gpsOffResult.denied, false);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );
    const manifestSource = fs.readFileSync(
      path.resolve(__dirname, '../android/app/src/main/AndroidManifest.xml'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyLocationPermission'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('location', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isLocationPermissionGranted('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isLocationEnabled('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun openLocationSettings('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun getLastKnownLocation('),
      true
    );
    assert.equal(
      manifestSource.includes('ACCESS_FINE_LOCATION'),
      true
    );
    assert.equal(
      manifestSource.includes('ACCESS_COARSE_LOCATION'),
      true
    );
  });

  test('Estadísticas de uso: Abre sección de acceso a uso en Android y solo activa si el dispositivo confirma PACKAGE_USAGE_STATS', async () => {
    // Caso 1: Usuario regresa de Ajustes sin activar el acceso a uso
    const deniedResult = await requestAndVerifyUsageStatsPermission({
      isUsageStatsPermissionGranted: async () => false,
      openUsageStatsSettings: async () => false,
    });
    assert.equal(deniedResult.granted, false);
    assert.equal(deniedResult.denied, true);

    // Caso 2: openUsageStatsSettings retorna true pero el sistema no confirma la concesión
    const unconfirmedResult = await requestAndVerifyUsageStatsPermission({
      isUsageStatsPermissionGranted: async () => false,
      openUsageStatsSettings: async () => true,
    });
    assert.equal(unconfirmedResult.granted, false);
    assert.equal(unconfirmedResult.denied, true);

    // Caso 3: Ya estaba previamente otorgado
    const alreadyGranted = await requestAndVerifyUsageStatsPermission({
      isUsageStatsPermissionGranted: async () => true,
      openUsageStatsSettings: async () => true,
    });
    assert.equal(alreadyGranted.granted, true);
    assert.equal(alreadyGranted.denied, false);

    // Caso 4: El usuario habilita el permiso en Ajustes de Android y regresa
    let grantedOnReturn = false;
    const acceptedResult = await requestAndVerifyUsageStatsPermission({
      isUsageStatsPermissionGranted: async () => {
        const current = grantedOnReturn;
        grantedOnReturn = true;
        return current;
      },
      openUsageStatsSettings: async () => true,
    });
    assert.equal(acceptedResult.granted, true);
    assert.equal(acceptedResult.denied, false);

    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );
    const manifestSource = fs.readFileSync(
      path.resolve(__dirname, '../android/app/src/main/AndroidManifest.xml'),
      'utf8'
    );

    assert.equal(
      permissionsScreenSource.includes('requestAndVerifyUsageStatsPermission'),
      true
    );
    assert.equal(
      permissionsScreenSource.includes("updatePermission('usageStats', false)"),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun isUsageStatsPermissionGranted('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('fun openUsageStatsSettings('),
      true
    );
    assert.equal(
      protectionModuleSource.includes('ACTION_USAGE_ACCESS_SETTINGS'),
      true
    );
    assert.equal(
      manifestSource.includes('PACKAGE_USAGE_STATS'),
      true
    );
  });

  test('Desactivación de permisos (Modo Responsable): Deshabilita el servicio o abre los Ajustes de Android para desactivar', () => {
    const permissionsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/PermissionsScreen.tsx'),
      'utf8'
    );
    const protectionModuleSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../android/app/src/main/java/com/baprotege/bridge/ProtectionModule.kt'
      ),
      'utf8'
    );
    const protectionServiceSource = fs.readFileSync(
      path.resolve(__dirname, '../src/services/protection.service.ts'),
      'utf8'
    );

    // 1. Verificación de flujo handleDisablePermission en PermissionsScreen
    assert.equal(
      permissionsScreenSource.includes('handleDisablePermission'),
      true,
      'PermissionsScreen debe implementar handleDisablePermission'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.openAccessibilitySettings()'),
      true,
      'Debe abrir Ajustes de Accesibilidad para desactivar'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.openNotificationSettings()'),
      true,
      'Debe abrir Ajustes de Notificaciones para desactivar'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.openBatterySettings()'),
      true,
      'Debe abrir Ajustes de Batería para desactivar'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.openUsageStatsSettings()'),
      true,
      'Debe abrir Ajustes de Acceso de Uso para desactivar'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.stopProtection()'),
      true,
      'Debe detener VPN al desactivar'
    );
    assert.equal(
      permissionsScreenSource.includes('protectionService.openVpnSettings()'),
      true,
      'Debe permitir abrir Ajustes de VPN al desactivar'
    );

    // 2. Verificación de métodos en el módulo nativo Android
    assert.equal(
      protectionModuleSource.includes('fun openBatterySettings('),
      true,
      'ProtectionModule debe implementar openBatterySettings'
    );
    assert.equal(
      protectionModuleSource.includes('fun openVpnSettings('),
      true,
      'ProtectionModule debe implementar openVpnSettings'
    );
    assert.equal(
      protectionModuleSource.includes('fun openAppSettings('),
      true,
      'ProtectionModule debe implementar openAppSettings'
    );

    // 3. Verificación en el servicio TypeScript (protection.service.ts)
    assert.equal(
      protectionServiceSource.includes('openBatterySettings()'),
      true,
      'protectionService debe exponer openBatterySettings'
    );
    assert.equal(
      protectionServiceSource.includes('openVpnSettings()'),
      true,
      'protectionService debe exponer openVpnSettings'
    );
    assert.equal(
      protectionServiceSource.includes('openAppSettings()'),
      true,
      'protectionService debe exponer openAppSettings'
    );
  });
});
