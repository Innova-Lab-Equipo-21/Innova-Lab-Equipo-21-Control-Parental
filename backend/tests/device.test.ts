// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Módulo de Dispositivos)
// Archivo: tests/device.test.ts
// Descripción: Suite de tests de integración para el módulo de dispositivos:
//              generación y validación de código de vinculación QR/PIN, pareado
//              del dispositivo protegido y listado en el panel del responsable.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Módulo de Dispositivos y Vinculación (Device API)', () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
          resolve();
        }
      });
    });

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `tutor_device_${Date.now()}@baprotege.gob.ar`,
        password: 'PasswordSegura2026!',
        fullName: 'Lucia Morales',
      }),
    });
    const data = await res.json();
    authToken = data.data.token;
  });

  after((_, done) => {
    server.close(done);
  });

  let generatedPairingCode: string;
  const testDeviceUuid = `dev-test-uuid-${Date.now()}`;

  test('POST /api/devices/pair/generate debe generar un código de 6 dígitos para el tutor', async () => {
    const res = await fetch(`${baseUrl}/api/devices/pair/generate`, {
       method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        childName: 'Sofia',
        gender: 'FEMENINO',
        personType: 'MENOR',
        birthDate: '2012-05-15',
        phone: '11 2345-6789',
      }),
    });
  
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.pairingCode);
    assert.match(data.data.pairingCode, /^\d{6}$/, 'El código debe ser de 6 dígitos numéricos');
    generatedPairingCode = data.data.pairingCode;
  });

  test('POST /api/devices/pair/confirm debe rechazar códigos inválidos', async () => {
    const res = await fetch(`${baseUrl}/api/devices/pair/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: '000000',
        deviceUuid: testDeviceUuid,
        deviceName: 'Samsung Galaxy A54',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('POST /api/devices/pair/confirm debe vincular con éxito el dispositivo del menor', async () => {
    const res = await fetch(`${baseUrl}/api/devices/pair/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: generatedPairingCode,
        deviceUuid: testDeviceUuid,
        deviceName: 'Samsung Galaxy A54 de Lucas',
        childName: 'Lucas',
        model: 'SM-A546E',
        osVersion: 'Android 14',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.deviceUuid, testDeviceUuid);
    assert.ok(data.data.deviceId);
  });

  test('GET /api/devices debe listar el dispositivo vinculado en el panel del tutor', async () => {
    const res = await fetch(`${baseUrl}/api/devices`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.some((d: any) => d.deviceUuid === testDeviceUuid));
  });
});
