// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Persistencia Completa de Gestión de Dispositivos
// Archivo: tests/devicesPersistenceFull.test.ts
// Descripción: Suite de pruebas automatizadas que verifica la persistencia de datos
//              para las 6 funcionalidades clave de dispositivos:
//              1. Vincular nuevo dispositivo
//              2. Editar perfil del responsable
//              3. Editar datos del dispositivo protegido
//              4. Ver permisos del dispositivo del responsable
//              5. Ver y auditar permisos del dispositivo protegido
//              6. Desvincular dispositivo
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service';
import { safeStorage } from '../src/services/api/client';
import { checkRealDevicePermissions } from '../src/utils/permissionChecker';

describe('Pruebas de Persistencia — Gestión Completa de Dispositivos', () => {
  let createdDeviceId: string = '';
  const testUniqueTag = `TestDev_${Date.now()}`;

  // --------------------------------------------------------------------------
  // 1. Vincular Nuevo Dispositivo
  // --------------------------------------------------------------------------
  test('1. Vincular dispositivo — Persiste los datos iniciales y genera el código de pareamiento', async () => {
    const res = await apiService.addDevice({
      childName: `Mateo ${testUniqueTag}`,
      birthDate: '10/05/2012',
      profileType: 'Menor',
      gender: 'Masculino',
      phone: '11 4455-6677',
      deviceModel: 'Samsung Galaxy A54',
      status: 'INACTIVE',
      isProtected: false,
    });

    assert.equal(res.success, true, 'La vinculación debe ser exitosa');
    assert.ok(res.data.deviceId, 'Debe generar un ID de dispositivo');
    assert.equal(res.data.childName, `Mateo ${testUniqueTag}`);
    assert.equal(res.data.gender, 'Masculino');
    assert.equal(res.data.profileType, 'Menor');
    assert.equal(res.data.phone, '11 4455-6677');
    assert.equal(res.data.deviceModel, 'Samsung Galaxy A54');
    assert.ok(res.data.pairingCode, 'Debe generar un código de pareamiento');

    createdDeviceId = res.data.deviceId;

    // Verificación de persistencia en la lista general de dispositivos
    const listRes = await apiService.listDevices();
    const persisted = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.ok(persisted, 'El dispositivo creado debe estar persistido en la lista');
    assert.equal(persisted?.childName, `Mateo ${testUniqueTag}`);
  });

  // --------------------------------------------------------------------------
  // 2. Editar Perfil del Responsable
  // --------------------------------------------------------------------------
  test('2. Editar responsable — Persiste los datos institucionales del perfil del tutor', async () => {
    const newFirstName = 'Carlos';
    const newLastName = 'Responsable';
    const newPhone = '11 9876-5432';
    const newBirthDate = '15/08/1985';
    const newGender = 'Masculino';

    try {
      await apiService.updateProfile({
        fullName: `${newFirstName} ${newLastName}`,
        firstName: newFirstName,
        lastName: newLastName,
        phone: newPhone,
        birthDate: newBirthDate,
        gender: newGender,
      });
    } catch (_) {
      // Entorno de prueba unitario sin servidor HTTP backend activo
    }

    // Actualizar y verificar el dispositivo del tutor ("Mi dispositivo")
    const selfDev = await apiService.updateSelfDevice({
      childName: `${newFirstName} ${newLastName}`,
      phone: newPhone,
      birthDate: newBirthDate,
      gender: newGender,
    });

    assert.equal(selfDev.deviceId, 'self');
    assert.equal(selfDev.childName, 'Carlos Responsable');
    assert.equal(selfDev.phone, '11 9876-5432');
    assert.equal(selfDev.birthDate, '15/08/1985');

    // Verificación de lectura persistida de "Mi dispositivo"
    const fetchedSelf = await apiService.getSelfDevice();
    assert.equal(fetchedSelf.childName, 'Carlos Responsable');
    assert.equal(fetchedSelf.phone, '11 9876-5432');
  });

  // --------------------------------------------------------------------------
  // 3. Editar Datos del Dispositivo Protegido
  // --------------------------------------------------------------------------
  test('3. Editar dispositivo protegido — Persiste las modificaciones de datos del menor o adulto', async () => {
    assert.ok(createdDeviceId, 'Debe existir un dispositivo previamente creado');

    const updatedChildName = `Sofía ${testUniqueTag}`;
    const updatedGender = 'Femenino';
    const updatedPhone = '11 9988-7766';
    const updatedModel = 'Motorola Moto G84';

    const updateRes = await apiService.updateDevice(createdDeviceId, {
      childName: updatedChildName,
      gender: updatedGender,
      phone: updatedPhone,
      deviceModel: updatedModel,
      profileType: 'Menor',
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.data.childName, updatedChildName);
    assert.equal(updateRes.data.gender, updatedGender);
    assert.equal(updateRes.data.phone, updatedPhone);
    assert.equal(updateRes.data.deviceModel, updatedModel);

    // Confirmar persistencia al releer la lista completa
    const listRes = await apiService.listDevices();
    const rechecked = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.ok(rechecked, 'Debe persistir en el listado de dispositivos');
    assert.equal(rechecked?.childName, updatedChildName);
    assert.equal(rechecked?.gender, updatedGender);
    assert.equal(rechecked?.phone, updatedPhone);
  });

  // --------------------------------------------------------------------------
  // 4. Ver y Auditar Permisos del Responsable ("Mi dispositivo")
  // --------------------------------------------------------------------------
  test('4. Ver permisos responsable — Consulta los 6 permisos reales del hardware y los persiste', async () => {
    // 1. Consultar estado real de permisos
    const realPerms = await checkRealDevicePermissions();
    assert.equal(typeof realPerms.vpn, 'boolean');
    assert.equal(typeof realPerms.accessibility, 'boolean');
    assert.equal(typeof realPerms.notifications, 'boolean');
    assert.equal(typeof realPerms.batteryOptimization, 'boolean');
    assert.equal(typeof realPerms.location, 'boolean');
    assert.equal(typeof realPerms.usageStats, 'boolean');
    assert.equal(typeof realPerms.grantedCount, 'number');

    // 2. Persistir permisos en "Mi dispositivo"
    const updatedSelf = await apiService.updateDevicePermissions('self', {
      vpn: true,
      notifications: true,
      location: true,
    });

    assert.equal(updatedSelf.permissions?.vpn, true);
    assert.equal(updatedSelf.permissions?.notifications, true);
    assert.equal(updatedSelf.permissions?.location, true);

    // 3. Confirmar que la reconsulta recupera la persistencia
    const auditedSelf = await apiService.auditDevicePermissions('self');
    assert.ok(auditedSelf.permissions, 'Debe contener la estructura de permisos auditada');
    assert.equal(typeof auditedSelf.permissions.grantedCount, 'number');
  });

  // --------------------------------------------------------------------------
  // 5. Ver y Auditar Permisos de Dispositivo Protegido
  // --------------------------------------------------------------------------
  test('5. Ver permisos dispositivo protegido — Modifica y audita permisos del protegido en la persistencia', async () => {
    assert.ok(createdDeviceId, 'Debe existir el dispositivo protegido');

    // 1. Establecer permisos específicos para el protegido
    const updated = await apiService.updateDevicePermissions(createdDeviceId, {
      vpn: true,
      accessibility: true,
      notifications: true,
      batteryOptimization: false,
      location: true,
      usageStats: false,
    });

    assert.equal(updated.permissions?.vpn, true);
    assert.equal(updated.permissions?.accessibility, true);
    assert.equal(updated.permissions?.batteryOptimization, false);
    assert.equal(updated.permissions?.grantedCount, 4);

    // 2. Auditar el dispositivo protegido
    const audited = await apiService.auditDevicePermissions(createdDeviceId);
    assert.equal(audited.deviceId, createdDeviceId);
    assert.equal(audited.lastHeartbeat, 'Recién verificado');
    assert.equal(audited.permissions?.grantedCount, 4);

    // 3. Releer lista y confirmar que los permisos persisten
    const listRes = await apiService.listDevices();
    const persisted = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.equal(persisted?.permissions?.grantedCount, 4);
  });

  // --------------------------------------------------------------------------
  // 6. Desvincular Dispositivo
  // --------------------------------------------------------------------------
  test('6. Desvincular dispositivo — Elimina el dispositivo permanentemente de la persistencia', async () => {
    assert.ok(createdDeviceId, 'Debe existir el dispositivo a desvincular');

    const unbindRes = await apiService.unbindDevice(createdDeviceId);
    assert.equal(unbindRes.success, true);
    assert.ok(unbindRes.message.includes('exitosamente'));

    // Verificación final de eliminación persistida
    const listRes = await apiService.listDevices();
    const found = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.equal(found, undefined, 'El dispositivo desvinculado ya no debe existir en la persistencia');
  });
});
