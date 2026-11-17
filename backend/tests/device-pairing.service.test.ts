// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests — Vinculación de dispositivos, capa de servicio)
// Archivo: tests/device-pairing.service.test.ts
// Descripción: Prueba el servicio de vinculación en modo mock, sin HTTP ni Firebase:
//              límite de 5 dispositivos, datos del protegido, código de un solo uso
//              y reemplazo del código pendiente.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/environment.js';
import { deviceService, type GeneratePairingCodeInput } from '../src/services/device.service.js';

// Protección: con USE_MOCK_DATA=false estos tests escribirían en la base compartida.
if (!env.USE_MOCK_DATA) {
  throw new Error('Estos tests deben correrse con USE_MOCK_DATA=true');
}

const minor: Omit<GeneratePairingCodeInput, 'userId'> = {
  childName: 'Sofia',
  gender: 'FEMENINO',
  personType: 'MENOR',
  birthDate: '2012-05-15',
  phone: '1123456789',
};

let seq = 0;
const newUserId = () => `user-test-${Date.now()}-${seq++}`;
const newDeviceUuid = () => `dev-test-${Date.now()}-${seq++}`;

async function findDevice(userId: string, deviceUuid: string) {
  const devices = (await deviceService.getDevicesByUser(userId)) as any[];
  return devices.find((d) => d.deviceUuid === deviceUuid);
}

async function linkDevice(userId: string) {
  const { pairingCode } = await deviceService.generatePairingCode({ userId, ...minor });
  return deviceService.confirmPairing({
    pairingCode,
    deviceUuid: newDeviceUuid(),
    deviceName: 'Celular de prueba',
  });
}

describe('Vinculación de dispositivos (servicio, modo mock)', () => {
  test('rechaza generar un código cuando el tutor ya tiene 5 dispositivos', async () => {
    const userId = newUserId();
    for (let i = 0; i < 5; i++) {
      await linkDevice(userId);
    }

    await assert.rejects(
      deviceService.generatePairingCode({ userId, ...minor }),
      /5 dispositivos/,
    );
  });

  test('copia los datos del protegido al dispositivo al confirmar', async () => {
    const userId = newUserId();
    const deviceUuid = newDeviceUuid();
    const { pairingCode } = await deviceService.generatePairingCode({ userId, ...minor });

    await deviceService.confirmPairing({
      pairingCode,
      deviceUuid,
      deviceName: 'Celular de Sofia',
      childName: 'Otro nombre',
    });

    const device = await findDevice(userId, deviceUuid);
    assert.ok(device, 'El dispositivo debe figurar en el panel del tutor');
    assert.equal(device.childName, 'Sofia', 'Prevalece el nombre que cargó el tutor');
    assert.equal(device.gender, 'FEMENINO');
    assert.equal(device.personType, 'MENOR');
    assert.equal(device.birthDate, '2012-05-15');
    assert.equal(device.phone, '1123456789');
  });

  test('un código no se puede usar dos veces', async () => {
    const userId = newUserId();
    const { pairingCode } = await deviceService.generatePairingCode({ userId, ...minor });

    await deviceService.confirmPairing({
      pairingCode,
      deviceUuid: newDeviceUuid(),
      deviceName: 'Primer celular',
    });

    await assert.rejects(
      deviceService.confirmPairing({
        pairingCode,
        deviceUuid: newDeviceUuid(),
        deviceName: 'Segundo celular',
      }),
      /ya utilizado/,
    );
  });

  test('generar un código nuevo invalida el anterior y actualiza los datos', async () => {
    const userId = newUserId();
    const first = await deviceService.generatePairingCode({ userId, ...minor });
    const second = await deviceService.generatePairingCode({
      userId,
      ...minor,
      childName: 'Sofia Corregida',
    });

    assert.notEqual(first.pairingCode, second.pairingCode);

    await assert.rejects(
      deviceService.confirmPairing({
        pairingCode: first.pairingCode,
        deviceUuid: newDeviceUuid(),
        deviceName: 'Celular',
      }),
      /ya utilizado/,
    );

    const deviceUuid = newDeviceUuid();
    await deviceService.confirmPairing({
      pairingCode: second.pairingCode,
      deviceUuid,
      deviceName: 'Celular',
    });

    const device = await findDevice(userId, deviceUuid);
    assert.equal(device.childName, 'Sofia Corregida');
  });
});