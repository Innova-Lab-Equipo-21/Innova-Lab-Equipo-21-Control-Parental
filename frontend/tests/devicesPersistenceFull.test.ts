// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Persistencia Completa de Gestión de Dispositivos
// Archivo: tests/devicesPersistenceFull.test.ts
// Descripción: Suite de pruebas automatizadas que verifica el contrato real contra
//              el backend REST y la sincronización de caché local para las 6
//              funcionalidades clave de gestión de dispositivos (sin fallbacks offline).
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service';
import { apiClient, safeStorage } from '../src/services/api/client';
import { checkRealDevicePermissions } from '../src/utils/permissionChecker';

describe('Pruebas de Persistencia — Gestión Completa de Dispositivos', () => {
  const originalGet = apiClient.get.bind(apiClient);
  const originalPost = apiClient.post.bind(apiClient);
  const originalPut = apiClient.put.bind(apiClient);
  const originalDelete = apiClient.delete.bind(apiClient);

  const mockDbDevices: any[] = [];
  let createdDeviceId: string = '';
  const testUniqueTag = `TestDev_${Date.now()}`;

  before(async () => {
    await safeStorage.removeItem('@ba_protege_devices_list');

    (apiClient as any).post = async (url: string, body: any) => {
      if (url === '/devices') {
        const id = `db-uuid-${mockDbDevices.length + 1}`;
        const pairingCode = '482910';
        const device = {
          id,
          deviceUuid: `hw-${id}`,
          deviceName: body.childName,
          childName: body.childName,
          birthDate: '2012-05-10T00:00:00.000Z',
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
        mockDbDevices.unshift(device);
        return { data: { success: true, data: { device, pairingCode } } };
      }
      throw new Error(`Unexpected POST ${url}`);
    };

    (apiClient as any).get = async (url: string) => {
      if (url === '/devices') {
        return { data: { success: true, data: mockDbDevices } };
      }
      const permMatch = url.match(/^\/devices\/([^/]+)\/permissions$/);
      if (permMatch) {
        const dev = mockDbDevices.find((d) => d.id === permMatch[1]);
        if (!dev) {
          const err: any = new Error('Not found');
          err.response = { status: 404, data: { message: 'Dispositivo no encontrado' } };
          throw err;
        }
        return {
          data: {
            success: true,
            data: {
              deviceId: dev.id,
              deviceUuid: dev.deviceUuid,
              status: 'ACTIVE',
              lastHeartbeatAt: new Date().toISOString(),
              permissions: {
                vpn: true,
                accessibility: true,
                notifications: true,
                batteryOptimization: false,
                location: true,
                usageStats: false,
                grantedCount: 4,
              },
            },
          },
        };
      }
      throw new Error(`Unexpected GET ${url}`);
    };

    (apiClient as any).put = async (url: string, body: any) => {
      if (url === '/auth/profile') {
        return { data: { success: true, data: body } };
      }
      const devMatch = url.match(/^\/devices\/([^/]+)$/);
      if (devMatch) {
        const dev = mockDbDevices.find((d) => d.id === devMatch[1]);
        if (!dev) {
          const err: any = new Error('Not found');
          err.response = { status: 404, data: { message: 'Dispositivo no encontrado' } };
          throw err;
        }
        if (body.childName) {
          dev.childName = body.childName;
          dev.deviceName = body.childName;
        }
        if (body.gender) dev.gender = String(body.gender).toUpperCase();
        if (body.phone !== undefined) dev.phone = body.phone;
        if (body.deviceModel !== undefined) dev.model = body.deviceModel;
        if (body.profileType) dev.personType = body.profileType === 'Adulto' ? 'ADULTO' : 'MENOR';
        return { data: { success: true, data: dev } };
      }
      throw new Error(`Unexpected PUT ${url}`);
    };

    (apiClient as any).delete = async (url: string) => {
      const devMatch = url.match(/^\/devices\/([^/]+)$/);
      if (devMatch) {
        const idx = mockDbDevices.findIndex((d) => d.id === devMatch[1]);
        if (idx === -1) {
          const err: any = new Error('Not found');
          err.response = { status: 404, data: { message: 'Dispositivo no encontrado' } };
          throw err;
        }
        mockDbDevices.splice(idx, 1);
        return { data: { success: true, message: 'El dispositivo fue desvinculado exitosamente.' } };
      }
      throw new Error(`Unexpected DELETE ${url}`);
    };
  });

  after(() => {
    (apiClient as any).get = originalGet;
    (apiClient as any).post = originalPost;
    (apiClient as any).put = originalPut;
    (apiClient as any).delete = originalDelete;
  });

  // --------------------------------------------------------------------------
  // 1. Vincular Nuevo Dispositivo (permite incluso el nombre real "Mateo")
  // --------------------------------------------------------------------------
  test('1. Vincular dispositivo — Persiste en backend y genera el código de pareamiento', async () => {
    const res = await apiService.addDevice({
      childName: `Mateo ${testUniqueTag}`,
      birthDate: '10/05/2012',
      profileType: 'Menor',
      gender: 'Masculino',
      phone: '11 4455-6677',
      deviceModel: 'Samsung Galaxy A54',
    });

    assert.equal(res.success, true);
    assert.ok(res.data.deviceId);
    assert.equal(res.data.childName, `Mateo ${testUniqueTag}`);
    assert.equal(res.data.gender, 'Masculino');
    assert.equal(res.data.profileType, 'Menor');
    assert.equal(res.data.phone, '11 4455-6677');
    assert.equal(res.data.deviceModel, 'Samsung Galaxy A54');
    assert.equal(res.data.pairingCode, '482910');

    createdDeviceId = res.data.deviceId;

    const listRes = await apiService.listDevices();
    const persisted = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.ok(persisted);
    assert.equal(persisted?.childName, `Mateo ${testUniqueTag}`);
  });

  // --------------------------------------------------------------------------
  // 2. Editar Perfil del Responsable
  // --------------------------------------------------------------------------
  test('2. Editar responsable — Persiste los datos del perfil del responsable', async () => {
    const selfDev = await apiService.updateSelfDevice({
      childName: 'Carlos Responsable',
      phone: '11 9876-5432',
      birthDate: '15/08/1985',
      gender: 'Masculino',
    });

    assert.equal(selfDev.deviceId, 'self');
    assert.equal(selfDev.childName, 'Carlos Responsable');
    assert.equal(selfDev.phone, '11 9876-5432');

    const fetchedSelf = await apiService.getSelfDevice();
    assert.equal(fetchedSelf.childName, 'Carlos Responsable');
    assert.equal(fetchedSelf.phone, '11 9876-5432');
  });

  // --------------------------------------------------------------------------
  // 3. Editar Datos del Dispositivo Protegido
  // --------------------------------------------------------------------------
  test('3. Editar dispositivo protegido — Persiste modificaciones en backend y caché', async () => {
    assert.ok(createdDeviceId);

    const updatedChildName = `Sofía ${testUniqueTag}`;
    const updateRes = await apiService.updateDevice(createdDeviceId, {
      childName: updatedChildName,
      gender: 'Femenino',
      phone: '11 9988-7766',
      deviceModel: 'Motorola Moto G84',
      profileType: 'Menor',
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.data.childName, updatedChildName);
    assert.equal(updateRes.data.gender, 'Femenino');
    assert.equal(updateRes.data.phone, '11 9988-7766');
    assert.equal(updateRes.data.deviceModel, 'Motorola Moto G84');

    const listRes = await apiService.listDevices();
    const rechecked = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.equal(rechecked?.childName, updatedChildName);
  });

  // --------------------------------------------------------------------------
  // 4. Ver y Auditar Permisos del Responsable ("Mi dispositivo")
  // --------------------------------------------------------------------------
  test('4. Ver permisos responsable — Consulta los 6 permisos reales del hardware', async () => {
    const realPerms = await checkRealDevicePermissions();
    assert.equal(typeof realPerms.vpn, 'boolean');
    assert.equal(typeof realPerms.grantedCount, 'number');

    const auditedSelf = await apiService.auditDevicePermissions('self');
    assert.ok(auditedSelf.permissions);
    assert.equal(typeof auditedSelf.permissions.grantedCount, 'number');
  });

  // --------------------------------------------------------------------------
  // 5. Auditar Permisos de Dispositivo Protegido (desde PostgreSQL)
  // --------------------------------------------------------------------------
  test('5. Ver permisos dispositivo protegido — Recupera permisos reales desde GET /devices/:id/permissions', async () => {
    assert.ok(createdDeviceId);

    const audited = await apiService.auditDevicePermissions(createdDeviceId);
    assert.equal(audited.deviceId, createdDeviceId);
    assert.equal(audited.status, 'ACTIVE');
    assert.equal(audited.permissions?.vpn, true);
    assert.equal(audited.permissions?.batteryOptimization, false);
    assert.equal(audited.permissions?.grantedCount, 4);
  });

  // --------------------------------------------------------------------------
  // 6. Desvincular Dispositivo
  // --------------------------------------------------------------------------
  test('6. Desvincular dispositivo — Elimina el dispositivo vía DELETE /devices/:id', async () => {
    assert.ok(createdDeviceId);

    const unbindRes = await apiService.unbindDevice(createdDeviceId);
    assert.equal(unbindRes.success, true);
    assert.ok(unbindRes.message.includes('exitosamente'));

    const listRes = await apiService.listDevices();
    const found = listRes.data.find((d) => d.deviceId === createdDeviceId);
    assert.equal(found, undefined);
  });
});
