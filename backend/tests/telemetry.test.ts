// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Módulo de Telemetría)
// Archivo: tests/telemetry.test.ts
// Descripción: Suite de tests de integración para el módulo de telemetría:
//              heartbeats de estado VPN, registro de dominios bloqueados, eventos
//              de seguridad anti-evasión y estados efectivos del dispositivo.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Módulo de Telemetría y Seguridad (Telemetry API)', () => {
  let server: Server;
  let baseUrl: string;
  const testDeviceUuid = `dev-telemetry-${Date.now()}`;

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

    // Registrar tutor y vincular dispositivo para pruebas de telemetría
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `tutor_telemetry_${Date.now()}@baprotege.gob.ar`,
        password: 'PasswordSegura2026!',
        fullName: 'Andres Fernandez',
      }),
    });
    const regData = await regRes.json();
    const token = regData.data.token;

    const pairGenRes = await fetch(`${baseUrl}/api/devices/pair/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const pairGenData = await pairGenRes.json();

    await fetch(`${baseUrl}/api/devices/pair/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: pairGenData.data.pairingCode,
        deviceUuid: testDeviceUuid,
        deviceName: 'Motorola Edge 40',
        childName: 'Sofia',
      }),
    });
  });

  after((_, done) => {
    server.close(done);
  });

  test('POST /api/telemetry/heartbeat debe procesar latido activo y responder estado ACTIVE', async () => {
    const res = await fetch(`${baseUrl}/api/telemetry/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceUuid: testDeviceUuid,
        vpnActive: true,
        permissionsOk: true,
        batteryLevel: 85,
        isCharging: false,
        blocklistVersion: 1,
        appVersion: '1.0.0',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.effectiveStatus, 'ACTIVE');
  });

  test('POST /api/telemetry/heartbeat con VPN desactivada debe reportar INACTIVE', async () => {
    const res = await fetch(`${baseUrl}/api/telemetry/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceUuid: testDeviceUuid,
        vpnActive: false,
        permissionsOk: true,
        blocklistVersion: 1,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.effectiveStatus, 'INACTIVE');
  });

  test('POST /api/telemetry/events/blocked debe registrar un intento bloqueado de apuestas', async () => {
    const res = await fetch(`${baseUrl}/api/telemetry/events/blocked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceUuid: testDeviceUuid,
        attemptedDomain: 'casino-clandestino-online.xyz',
        sourceListType: 'OFFICIAL_LOTBA',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data);
  });

  test('POST /api/telemetry/events/security debe registrar evento anti-evasión (VPN_DISABLED)', async () => {
    const res = await fetch(`${baseUrl}/api/telemetry/events/security`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceUuid: testDeviceUuid,
        eventType: 'VPN_DISABLED',
        description: 'Se detectó detención del túnel VPN de protección local',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data);
  });
});
