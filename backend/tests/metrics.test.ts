// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Módulo de Métricas)
// Archivo: tests/metrics.test.ts
// Descripción: Valida los endpoints GET /api/metrics/summary y GET /api/metrics/timeline.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Módulo de Métricas (Metrics API)', () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;
  const testDeviceUuid = `dev-metrics-${Date.now()}`;

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

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `tutor_metrics_${Date.now()}@baprotege.gob.ar`,
        password: 'PasswordSegura2026!',
        fullName: 'Mariana Lopez',
      }),
    });
    const regData = await regRes.json();
    authToken = regData.data.token;

    const pairGenRes = await fetch(`${baseUrl}/api/devices/pair/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        childName: 'Tomas',
        gender: 'Masculino',
        personType: 'Menor',
        birthDate: '2013-06-15',
      }),
    });
    const pairGenData = await pairGenRes.json();

    await fetch(`${baseUrl}/api/devices/pair/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: pairGenData.data.pairingCode,
        deviceUuid: testDeviceUuid,
        deviceName: 'Samsung Galaxy S23',
        childName: 'Tomas',
      }),
    });

    const blockedEvents = [
      { attemptedDomain: 'casino-uno.xyz', sourceListType: 'LOTBA' },
      { attemptedDomain: 'casino-dos.xyz', sourceListType: 'LOTBA' },
      { attemptedDomain: 'sitio-custom.xyz', sourceListType: 'CUSTOM' },
    ];

    for (const event of blockedEvents) {
      const res = await fetch(`${baseUrl}/api/telemetry/events/blocked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceUuid: testDeviceUuid, ...event }),
      });
      assert.equal(res.status, 201);
    }
  });

  after((_, done) => {
    server.close(done);
  });

  test('GET /api/metrics/summary debe devolver el resumen consolidado del panel', async () => {
    const res = await fetch(`${baseUrl}/api/metrics/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.groupName, 'Familia Lopez');
    assert.equal(data.data.activeDevices, 1);
    assert.equal(data.data.vpnUptime, 100);
    assert.equal(data.data.listVersion, 'v4');
    assert.equal(data.data.totalBlocks, 3);
    assert.equal(data.data.changePercentage, 100);

    const lotba = data.data.sources.find((source: any) => source.id === 'LOTBA');
    const custom = data.data.sources.find((source: any) => source.id === 'CUSTOM');
    assert.equal(lotba.label, 'Oficial LOTBA');
    assert.equal(lotba.count, 2);
    assert.equal(lotba.pct, 67);
    assert.equal(custom.label, 'Personalizada');
    assert.equal(custom.count, 1);
    assert.equal(custom.pct, 33);
  });

  test('GET /api/metrics/timeline debe devolver la línea de tiempo del día', async () => {
    const res = await fetch(`${baseUrl}/api/metrics/timeline`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.points.length, 24);
    assert.equal(
      data.data.points.reduce((total: number, value: number) => total + value, 0),
      3,
    );

    const liveHour = Number.parseInt(data.data.live.hour.slice(0, 2), 10);
    assert.equal(data.data.points[liveHour], data.data.live.total);
    assert.equal(data.data.live.lotba + data.data.live.custom, data.data.live.total);
    assert.ok(data.data.live.total >= 1);
    assert.equal(typeof data.data.live.isPeak, 'boolean');
  });

  test('GET /api/metrics/timeline?source=lotba debe filtrar solo la fuente oficial', async () => {
    const res = await fetch(`${baseUrl}/api/metrics/timeline?source=lotba`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(
      data.data.points.reduce((total: number, value: number) => total + value, 0),
      2,
    );
  });

  test('GET /api/metrics/timeline?source=custom debe filtrar solo la lista personalizada', async () => {
    const res = await fetch(`${baseUrl}/api/metrics/timeline?source=custom`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(
      data.data.points.reduce((total: number, value: number) => total + value, 0),
      1,
    );
  });

  test('GET /api/metrics/timeline debe rechazar un día inválido', async () => {
    const res = await fetch(`${baseUrl}/api/metrics/timeline?day=funday`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.equal(res.status, 422);
  });
});
