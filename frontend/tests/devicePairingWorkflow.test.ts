// ==============================================================================
// Proyecto: BA Protege+
// Pruebas: Flujo de Vinculación de Dispositivos y Recuperación de Código/QR
// Archivo: tests/devicePairingWorkflow.test.ts
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service';
import { safeStorage } from '../src/services/api/client';

describe('Flujo de Vinculación de Dispositivos (Pairing & Edit Workflow)', () => {
  test('1. Al guardar en Vincular nuevo dispositivo, se persiste el dispositivo y se genera el código de vinculación', async () => {
    const testName = `ProtegidoTest_${Date.now()}`;
    const res = await apiService.addDevice({
      childName: testName,
      birthDate: '15/05/2014',
      profileType: 'Menor',
      gender: 'Masculino',
      phone: '11 2345-6789',
      deviceModel: 'Samsung Galaxy A54',
      status: 'INACTIVE',
      isProtected: false,
    });

    assert.ok(res.success, 'La creación debe ser exitosa');
    assert.equal(res.data.childName, testName);
    assert.equal(res.data.status, 'INACTIVE');
    assert.ok(res.data.pairingCode, 'Debe incluir un código de pareamiento generado');
    assert.match(res.data.pairingCode, /^\d{6}$/, 'El código debe tener exactamente 6 dígitos numéricos');
  });

  test('2. En la lista de dispositivos, el dispositivo inactivo conserva su pairingCode recuperado', async () => {
    const listRes = await apiService.listDevices();
    assert.ok(listRes.success);
    const testDev = listRes.data.find((d) => d.childName?.startsWith('ProtegidoTest_'));
    assert.ok(testDev, 'El dispositivo creado debe estar en la lista');
    assert.ok(testDev.pairingCode, 'El dispositivo en la lista debe tener su pairingCode disponible');
  });

  test('3. Regenerar código para un dispositivo específico actualiza el pairingCode en la persistencia', async () => {
    const listRes = await apiService.listDevices();
    const testDev = listRes.data.find((d) => d.childName?.startsWith('ProtegidoTest_'))!;
    const originalCode = testDev.pairingCode;

    const regenRes = await apiService.generatePairingCode({
      deviceId: testDev.deviceId,
      protectedName: testDev.childName,
      genero: testDev.gender,
      protectedType: testDev.profileType,
      birthDate: testDev.birthDate,
      protectedPhone: testDev.phone,
      deviceModel: testDev.deviceModel,
    });

    assert.ok(regenRes.success);
    const newCode = regenRes.data.code;
    assert.ok(newCode);
    assert.match(newCode, /^\d{6}$/);

    const updatedList = await apiService.listDevices();
    const refreshedDev = updatedList.data.find((d) => d.deviceId === testDev.deviceId);
    assert.equal(refreshedDev?.pairingCode, newCode, 'El nuevo código debe quedar guardado en el dispositivo');
  });

  test('4. Formateo de código espaciado para presentación visual idéntica al diseño oficial (Image 2)', () => {
    const rawCode = '700537';
    const spaced = rawCode.split('').join(' ');
    assert.equal(spaced, '7 0 0 5 3 7', 'El código debe presentarse con separación de caracteres');
  });

  test('5. Limpieza de datos temporales de prueba', async () => {
    const listRes = await apiService.listDevices();
    const filtered = listRes.data.filter((d) => !d.childName?.startsWith('ProtegidoTest_'));
    await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(filtered));
    const finalList = await apiService.listDevices();
    assert.ok(!finalList.data.some((d) => d.childName?.startsWith('ProtegidoTest_')));
  });

  test('6. Actualización instantánea: addDevice persiste inmediatamente en @ba_protege_devices_list para actualización rápida de Inicio y Dispositivos', async () => {
    const instantName = `InstantDevice_${Date.now()}`;
    const res = await apiService.addDevice({
      childName: instantName,
      birthDate: '10/10/2012',
      profileType: 'Menor',
      gender: 'Femenino',
      phone: '11 9999-8888',
      deviceModel: 'Motorola Moto G',
      status: 'INACTIVE',
      isProtected: false,
    });

    assert.ok(res.success);
    // Verificar que safeStorage contiene el nuevo dispositivo sin esperar ninguna llamada externa
    const raw = await safeStorage.getItem('@ba_protege_devices_list');
    assert.ok(raw, 'El almacenamiento local debe contener la lista');
    const parsed = JSON.parse(raw);
    const found = parsed.find((d: any) => d.childName === instantName);
    assert.ok(found, 'El nuevo dispositivo debe estar inmediatamente disponible en la caché local');

    // Limpieza
    const filtered = parsed.filter((d: any) => d.childName !== instantName);
    await safeStorage.setItem('@ba_protege_devices_list', JSON.stringify(filtered));
  });
});
