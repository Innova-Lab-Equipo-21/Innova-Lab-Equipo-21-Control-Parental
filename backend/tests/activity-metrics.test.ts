// ==============================================================================
// Proyecto: BA Protege+
// Test Suite: activity-metrics.test.ts
// Descripción: Valida los nuevos endpoints de Actividad del backend en modo mock:
//              - POST /api/telemetry/pasatiempos y GET /api/telemetry/pasatiempos/:deviceUuid
//              - POST /api/telemetry/app-usage
//              - GET /api/metrics/device/:deviceUuid/activity
//              - GET /api/metrics/activity (Responsable autenticado)
// ==============================================================================

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';

process.env.USE_MOCK_DATA = 'true';

import { createApp } from '../src/app';
import { mockDb } from '../src/config/mock-database';

let server: http.Server;
let baseUrl = '';

async function req(
  method: string,
  urlPath: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Actividad Backend — Pasatiempos, Uso de Apps y Métricas', () => {
  let token = '';
  let minorDeviceUuid = '';

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    const email = `actividad_test_${Date.now()}@test.com`;
    const reg = await req('POST', '/api/auth/register', {
      fullName: 'Responsable Actividad Test',
      email,
      password: 'Password123!',
      role: 'PARENT',
    });
    assert.equal(reg.status, 201);
    token = reg.data.data.token;
    const parentId = reg.data.data.user.id;

    // Registrar un dispositivo protegido directamente en mockDb
    minorDeviceUuid = `uuid-menor-${Date.now()}`;
    mockDb.devices.push({
      id: `dev-menor-${Date.now()}`,
      userId: parentId,
      deviceUuid: minorDeviceUuid,
      deviceName: 'Celular de Tomás',
      childName: 'Tomás',
      profileType: 'Menor',
      osVersion: 'Android 14',
      isActive: true,
      createdAt: new Date(),
      status: {
        effectiveStatus: 'ACTIVE',
        vpnActive: true,
        permissionsOk: true,
        batteryLevel: 95,
        isCharging: false,
        currentBlocklistVersion: 1,
        lastHeartbeatAt: new Date(),
      },
    } as any);
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Registra respuestas diarias de Quiz, Sopa de letras (3 sopas) y Memoria con Racha', async () => {
    // Día anterior completado para validar Racha = 2 días
    const prevRes = await req('POST', '/api/telemetry/pasatiempos', {
      deviceUuid: minorDeviceUuid,
      dateKey: '2026-11-22',
      gameType: 'QUIZ',
      status: 'COMPLETED',
      correctCount: 5,
      wrongCount: 0,
      totalItems: 5,
      attempts: 5,
    });
    assert.equal(prevRes.status, 201);

    // Hoy: Quiz, Sopa de letras y Memoria
    const quizRes = await req('POST', '/api/telemetry/pasatiempos', {
      deviceUuid: minorDeviceUuid,
      dateKey: '2026-11-23',
      gameType: 'QUIZ',
      status: 'COMPLETED',
      correctCount: 4,
      wrongCount: 1,
      totalItems: 5,
      attempts: 5,
    });
    assert.equal(quizRes.status, 201);

    const wsRes = await req('POST', '/api/telemetry/pasatiempos', {
      deviceUuid: minorDeviceUuid,
      dateKey: '2026-11-23',
      gameType: 'WORDSEARCH',
      status: 'IN_PROGRESS',
      correctCount: 14,
      wrongCount: 6,
      totalItems: 20,
      attempts: 14,
      details: {
        foundByBoard: {
          planetas: ['SOL', 'MARTE', 'VENUS', 'TIERRA', 'SATURNO', 'URANO', 'NEPTUNO', 'JUPITER'],
          salud: ['AGUA', 'FRUTA', 'DORMIR', 'DEPORTE', 'CORRER', 'JUGAR'],
          valores: [],
        },
      },
    });
    assert.equal(wsRes.status, 201);

    const memRes = await req('POST', '/api/telemetry/pasatiempos', {
      deviceUuid: minorDeviceUuid,
      dateKey: '2026-11-23',
      gameType: 'MEMORY',
      status: 'COMPLETED',
      correctCount: 6,
      wrongCount: 0,
      totalItems: 6,
      attempts: 13,
    });
    assert.equal(memRes.status, 201);

    const histRes = await req(
      'GET',
      `/api/telemetry/pasatiempos/${minorDeviceUuid}?dateKey=2026-11-23`
    );
    assert.equal(histRes.status, 200);
    assert.equal(histRes.data.data.streakDays, 2);
    assert.equal(histRes.data.data.today.length, 3);
    assert.equal(histRes.data.data.weeklyQuizAccuracyPct, 90); // (5+4)/10
  });

  it('Persiste consumo diario de apps bloqueadas y retorna resumen en métricas de dispositivo y responsable', async () => {
    const usageRes = await req('POST', '/api/telemetry/app-usage', {
      deviceUuid: minorDeviceUuid,
      dateKey: '2026-11-23',
      apps: [
        {
          packageName: 'com.instagram.android',
          appName: 'Instagram',
          usedMinutes: 75,
          dailyLimitMinutes: 120,
          isBlocked: false,
        },
        {
          packageName: 'com.zhiliaoapp.musically',
          appName: 'TikTok',
          usedMinutes: 45,
          dailyLimitMinutes: 90,
          isBlocked: false,
        },
      ],
    });
    assert.equal(usageRes.status, 201);

    // Reportar un evento bloqueado de app LOTBA
    const blockRes = await req('POST', '/api/telemetry/events/blocked', {
      deviceUuid: minorDeviceUuid,
      attemptedDomain: 'com.apuestas.ilegal',
      sourceListType: 'LOTBA_APP',
    });
    assert.equal(blockRes.status, 201);

    // Endpoint de dispositivo protegido
    const devAct = await req(
      'GET',
      `/api/metrics/device/${minorDeviceUuid}/activity?dateKey=2026-11-23`
    );
    assert.equal(devAct.status, 200);
    assert.equal(devAct.data.data.pasatiempos.streakDays, 2);
    assert.equal(devAct.data.data.appUsage.length, 2);
    assert.equal(devAct.data.data.blockedEvents[0].itemType, 'app');
    assert.equal(devAct.data.data.blockedEvents[0].sourceListType, 'LOTBA');

    // Endpoint consolidado del Responsable
    const parentAct = await req(
      'GET',
      '/api/metrics/activity?dateKey=2026-11-23',
      undefined,
      token
    );
    assert.equal(parentAct.status, 200);
    assert.equal(parentAct.data.data.pasatiemposByDevice.length, 1);
    assert.equal(parentAct.data.data.pasatiemposByDevice[0].streakDays, 2);
    assert.equal(parentAct.data.data.appUsage.length, 2);
  });

  it('Persiste alertas de seguridad y marca readAt vía PATCH /api/metrics/security-events/:eventId/read', async () => {
    const secRes = await req('POST', '/api/telemetry/events/security', {
      deviceUuid: minorDeviceUuid,
      eventType: 'PERMISSION_REVOKED',
      description: 'Permiso de accesibilidad deshabilitado',
    });
    assert.equal(secRes.status, 201);
    const eventId = secRes.data.data.id;
    assert.ok(eventId);

    const beforeRead = await req(
      'GET',
      '/api/metrics/activity?dateKey=2026-11-23',
      undefined,
      token
    );
    assert.equal(beforeRead.status, 200);
    const createdAlert = beforeRead.data.data.securityEvents.find(
      (e: any) => e.id === eventId
    );
    assert.ok(createdAlert);
    assert.equal(createdAlert.readAt, null);

    const markRes = await req(
      'PATCH',
      `/api/metrics/security-events/${eventId}/read`,
      {},
      token
    );
    assert.equal(markRes.status, 200);
    assert.equal(markRes.data.data.persisted, true);
    assert.ok(markRes.data.data.readAt);

    const afterRead = await req(
      'GET',
      '/api/metrics/activity?dateKey=2026-11-23',
      undefined,
      token
    );
    assert.equal(afterRead.status, 200);
    const updatedAlert = afterRead.data.data.securityEvents.find(
      (e: any) => e.id === eventId
    );
    assert.ok(updatedAlert?.readAt);

    // También debe exponerse en GET /api/metrics/device/:deviceUuid/activity con readAt actualizado
    const devActAfter = await req(
      'GET',
      `/api/metrics/device/${minorDeviceUuid}/activity?dateKey=2026-11-23`
    );
    assert.equal(devActAfter.status, 200);
    assert.ok(Array.isArray(devActAfter.data.data.securityEvents));
    const devAlert = devActAfter.data.data.securityEvents.find(
      (e: any) => e.id === eventId
    );
    assert.ok(devAlert);
    assert.ok(devAlert.readAt);
  });
});
