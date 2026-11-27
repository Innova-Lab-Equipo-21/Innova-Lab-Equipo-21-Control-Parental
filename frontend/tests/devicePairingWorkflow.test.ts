// ==============================================================================
// Proyecto: BA Protege+
// Componente: Pruebas Automatizadas — Flujo de Vinculación de Dispositivos
// Archivo: tests/devicePairingWorkflow.test.ts
// Descripción: Valida creación de dispositivos, persistencia de código/QR real,
//              regeneración contra backend y rechazo sin códigos fallback locales.
// ==============================================================================

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service';
import { apiClient, safeStorage } from '../src/services/api/client';

describe('Flujo de Vinculación de Dispositivos (Pairing & Edit Workflow)', () => {
  const originalGet = apiClient.get.bind(apiClient);
  const originalPost = apiClient.post.bind(apiClient);
  const originalPut = apiClient.put.bind(apiClient);
  const originalDelete = apiClient.delete.bind(apiClient);

  const mockBackendDevices: any[] = [];
  let nextCodeCounter = 700537;

  beforeEach(async () => {
    mockBackendDevices.length = 0;
    await safeStorage.removeItem('@ba_protege_devices_list');

    (apiClient as any).post = async (url: string, body: any) => {
      if (url === '/devices') {
        const pairingCode = String(nextCodeCounter++);
        const created = {
          id: `uuid-dev-${mockBackendDevices.length + 1}`,
          deviceUuid: `hw-uuid-${mockBackendDevices.length + 1}`,
          deviceName: body.childName,
          childName: body.childName,
          birthDate: '2014-05-15T00:00:00.000Z',
          gender: String(body.gender || 'NO_INFORMADO').toUpperCase(),
          personType: body.profileType === 'Adulto' ? 'ADULTO' : 'MENOR',
          phone: body.phone || null,
          model: body.deviceModel || 'Android',
          pairingCode,
          status: {
            effectiveStatus: 'INACTIVE',
            vpnActive: false,
            permissionsOk: false,
            blocklistVersion: 1,
          },
          _count: { blockedEvents: 0 },
        };
        mockBackendDevices.unshift(created);
        return { data: { success: true, data: { device: created, pairingCode } } };
      }
      if (url === '/devices/pair/generate') {
        const newCode = String(nextCodeCounter++);
        const target = mockBackendDevices.find((d) => d.id === body?.deviceId);
        if (target) {
          target.pairingCode = newCode;
        }
        return { data: { success: true, data: { pairingCode: newCode } } };
      }
      throw new Error(`Unexpected POST ${url}`);
    };

    (apiClient as any).get = async (url: string) => {
      if (url === '/devices') {
        return { data: { success: true, data: mockBackendDevices } };
      }
      throw new Error(`Unexpected GET ${url}`);
    };
  });

  afterEach(() => {
    (apiClient as any).get = originalGet;
    (apiClient as any).post = originalPost;
    (apiClient as any).put = originalPut;
    (apiClient as any).delete = originalDelete;
  });

  test('1. Al guardar en Vincular nuevo dispositivo, se persiste en backend y devuelve el código real de 6 dígitos', async () => {
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

    assert.equal(res.success, true);
    assert.equal(res.data.childName, testName);
    assert.equal(res.data.status, 'INACTIVE');
    assert.equal(res.data.permissions?.grantedCount, 0, 'Un dispositivo inactivo no debe mostrar permisos ficticios');
    assert.ok(res.data.pairingCode);
    assert.match(res.data.pairingCode, /^\d{6}$/);
  });

  test('2. En la lista de dispositivos, el dispositivo inactivo conserva su pairingCode recuperado de PostgreSQL', async () => {
    await apiService.addDevice({
      childName: 'Sofía',
      birthDate: '15/05/2014',
      profileType: 'Menor',
      gender: 'Femenino',
      phone: '11 2345-6789',
      deviceModel: 'Samsung Galaxy A54',
    });

    const listRes = await apiService.listDevices();
    assert.equal(listRes.success, true);
    const testDev = listRes.data.find((d) => d.childName === 'Sofía');
    assert.ok(testDev);
    assert.match(testDev.pairingCode || '', /^\d{6}$/);
  });

  test('3. Regenerar código para un dispositivo específico actualiza el pairingCode desde el backend', async () => {
    const added = await apiService.addDevice({
      childName: 'Lucas',
      birthDate: '10/10/2012',
      profileType: 'Menor',
      gender: 'Masculino',
      phone: '11 9999-8888',
    });
    const originalCode = added.data.pairingCode;

    const regenRes = await apiService.generatePairingCode({
      deviceId: added.data.deviceId,
      protectedName: added.data.childName,
      genero: added.data.gender,
      protectedType: added.data.profileType,
      birthDate: added.data.birthDate,
      protectedPhone: added.data.phone,
    });

    assert.equal(regenRes.success, true);
    const newCode = regenRes.data.code;
    assert.match(newCode, /^\d{6}$/);
    assert.notEqual(newCode, originalCode);

    const updatedList = await apiService.listDevices();
    const refreshedDev = updatedList.data.find((d) => d.deviceId === added.data.deviceId);
    assert.equal(refreshedDev?.pairingCode, newCode);
  });

  test('4. Si el backend falla al generar código, NO fabrica un código fallback local y propaga el error', async () => {
    (apiClient as any).post = async () => {
      const err: any = new Error('Server error');
      err.response = { status: 500, data: { message: 'Error de base de datos al generar código' } };
      throw err;
    };

    await assert.rejects(
      () => apiService.generatePairingCode({ deviceId: 'uuid-dev-1' }),
      /Error de base de datos al generar código/
    );
  });

  test('5. Formateo de código espaciado para presentación visual', () => {
    const rawCode = '700537';
    const spaced = rawCode.split('').join(' ');
    assert.equal(spaced, '7 0 0 5 3 7');
  });

  test('6. Actualización instantánea en caché local tras respuesta real de addDevice', async () => {
    const instantName = `InstantDevice_${Date.now()}`;
    const res = await apiService.addDevice({
      childName: instantName,
      birthDate: '10/10/2012',
      profileType: 'Menor',
      gender: 'Femenino',
      phone: '11 9999-8888',
      deviceModel: 'Motorola Moto G',
    });

    assert.equal(res.success, true);
    const raw = await safeStorage.getItem('@ba_protege_devices_list');
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    const found = parsed.find((d: any) => d.childName === instantName);
    assert.ok(found);
  });
});
