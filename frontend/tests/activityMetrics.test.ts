// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Pestaña Actividad (Modo Responsable)
// Archivo: tests/activityMetrics.test.ts
// Descripción: Verifica los 5 bloques de métricas de Actividad:
//              1) Filtros: Dispositivos (Todos, Mi dispositivo, Dispositivo A..)
//                 y Período (Semana, Mes, Año, Total)
//              2) Bloqueos totales y variación porcentual respecto al período previo
//              3) Bloqueos por fuente (Lista LOTBA vs. Personalizada)
//              4) Franja horaria de intentos (24 horas + detección de hora pico)
//              5) Últimos intentos bloqueados y persistencia local de telemetría
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACTIVITY_PERIOD_OPTIONS,
  BlockedAttemptRecord,
  buildActivityDataset,
  buildDeviceFilterOptions,
  computeActivityMetrics,
  formatMetricNumber,
  formatRelativeAttemptTime,
} from '../src/utils/activityMetrics.js';
import { apiService } from '../src/services/api.service.js';
import { DeviceInfo } from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DAY_MS = 24 * 60 * 60 * 1000;

describe('Pestaña Actividad — Filtros de Dispositivos y Período', () => {
  test('Incluye exactamente los 4 períodos requeridos: Semana, Mes, Año y Total', () => {
    assert.deepEqual(
      ACTIVITY_PERIOD_OPTIONS.map((p) => p.label),
      ['Semana', 'Mes', 'Año', 'Total']
    );
    assert.deepEqual(
      ACTIVITY_PERIOD_OPTIONS.map((p) => p.key),
      ['week', 'month', 'year', 'total']
    );
  });

  test('Construye las opciones de dispositivos con Todos, Mi dispositivo y dispositivos vinculados ordenados A-Z', () => {
    const sampleDevices: DeviceInfo[] = [
      {
        deviceId: 'dev-b',
        deviceUuid: 'uuid-b',
        deviceName: 'Dispositivo B',
        childName: 'Dispositivo B',
        isProtected: true,
        status: 'ACTIVE',
        blockedCount: 12,
        blocklistVersion: 4,
        profileType: 'Adulto',
      },
      {
        deviceId: 'dev-a',
        deviceUuid: 'uuid-a',
        deviceName: 'Dispositivo A',
        childName: 'Dispositivo A',
        isProtected: true,
        status: 'ACTIVE',
        blockedCount: 25,
        blocklistVersion: 4,
        profileType: 'Menor',
      },
    ];

    const options = buildDeviceFilterOptions(sampleDevices, true);
    assert.deepEqual(
      options.map((o) => o.label),
      ['Todos', 'Mi dispositivo', 'Dispositivo A', 'Dispositivo B']
    );
    assert.equal(options[0].subtitle, '3 dispositivos');
  });
});

describe('Pestaña Actividad — Cálculo de Métricas (Totales, Fuente, Franja Horaria y Últimos)', () => {
  const fixedNow = new Date(2026, 10, 7, 22, 0, 0, 0).getTime(); // 22:00 local

  const buildAtOffset = (
    id: string,
    daysAgo: number,
    hour: number,
    minute: number,
    deviceId: string,
    deviceName: string,
    domain: string,
    sourceListType: 'LOTBA' | 'CUSTOM',
    count = 1
  ): BlockedAttemptRecord => {
    const d = new Date(fixedNow - daysAgo * DAY_MS);
    d.setHours(hour, minute, 0, 0);
    return {
      id,
      deviceId,
      deviceName,
      attemptedDomain: domain,
      sourceListType,
      blockedAt: d.toISOString(),
      count,
    };
  };

  const sampleRecords: BlockedAttemptRecord[] = [
    // Semana actual: 1.045 LOTBA + 381 CUSTOM = 1.426 totales (pico en 20h = 179)
    buildAtOffset('e1', 0, 21, 56, 'dev-a', 'Dispositivo A', 'ejemplo-apuestas.com', 'LOTBA', 1),
    buildAtOffset('e2', 0, 21, 38, 'dev-b', 'Dispositivo B', 'casino-demo.net', 'LOTBA', 1),
    buildAtOffset('e3', 0, 20, 45, 'dev-a', 'Dispositivo A', 'sitio-bloqueado.com', 'CUSTOM', 50),
    buildAtOffset('e4', 0, 20, 15, 'dev-a', 'Dispositivo A', 'apuestas-ilegal.bet', 'LOTBA', 129),
    buildAtOffset('e5', 2, 15, 10, 'dev-b', 'Dispositivo B', 'ruleta-clandestina.bet', 'LOTBA', 914),
    buildAtOffset('e6', 3, 18, 20, 'dev-b', 'Dispositivo B', 'red-restringida.com', 'CUSTOM', 331),
    // Semana previa (hace 10 días): 1.250 totales -> variación +14% en Semana
    buildAtOffset('prev-w1', 10, 19, 0, 'dev-a', 'Dispositivo A', 'casino-previo.bet', 'LOTBA', 1250),
    // Mes previo (hace 40 días): 2.000 totales
    buildAtOffset('prev-m1', 40, 17, 0, 'dev-b', 'Dispositivo B', 'poker-previo.com', 'LOTBA', 2000),
    // Año previo (hace 400 días): 4.000 totales
    buildAtOffset('prev-y1', 400, 16, 0, 'dev-a', 'Dispositivo A', 'historico.bet', 'LOTBA', 4000),
  ];

  test('Calcula Bloqueos totales, formato con punto de miles y variación porcentual vs. semana previa', () => {
    const weekAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'week',
      nowMs: fixedNow,
    });

    assert.equal(weekAll.totalBlocks, 1426);
    assert.equal(weekAll.formattedTotalBlocks, '1.426');
    assert.equal(weekAll.previousBlocks, 1250);
    assert.equal(weekAll.changePercentage, 14);
    assert.equal(weekAll.changeDirection, 'up');
    assert.equal(weekAll.changeBadgeText, '+14% vs. semana previa');
  });

  test('Calcula Bloqueos por fuente (Lista LOTBA vs. Personalizada) sumando exactamente 100%', () => {
    const weekAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'week',
      nowMs: fixedNow,
    });

    assert.equal(weekAll.sources.lotba.count, 1045);
    assert.equal(weekAll.sources.lotba.formattedCount, '1.045');
    assert.equal(weekAll.sources.lotba.pct, 73);

    assert.equal(weekAll.sources.custom.count, 381);
    assert.equal(weekAll.sources.custom.formattedCount, '381');
    assert.equal(weekAll.sources.custom.pct, 27);

    assert.equal(
      weekAll.sources.lotba.pct + weekAll.sources.custom.pct,
      100
    );
  });

  test('Calcula Franja horaria de intentos en 24 horas y detecta la hora pico exacta', () => {
    const weekAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'week',
      nowMs: fixedNow,
    });

    assert.equal(weekAll.hourly.length, 24);
    const sumHourly = weekAll.hourly.reduce((acc, b) => acc + b.total, 0);
    assert.equal(sumHourly, weekAll.totalBlocks);

    // En la hora 20 hay 50 CUSTOM + 129 LOTBA = 179 (o 15h = 914; verifiquemos el pico real)
    assert.equal(weekAll.hourly[20].total, 179);
    assert.equal(weekAll.hourly[20].custom, 50);
    assert.equal(weekAll.hourly[20].lotba, 129);
    assert.equal(weekAll.peakHour?.hour, 15);
    assert.equal(weekAll.peakHour?.rangeLabel, '15 a 16 h');
  });

  test('Filtra correctamente por dispositivo individual y por los períodos Mes, Año y Total', () => {
    const onlyDevA = computeActivityMetrics(sampleRecords, {
      deviceId: 'dev-a',
      period: 'week',
      nowMs: fixedNow,
    });
    assert.equal(onlyDevA.totalBlocks, 1 + 50 + 129);
    assert.equal(onlyDevA.peakHour?.fullLabel, 'Pico: 20 a 21 h (179)');
    assert.ok(onlyDevA.recentAttempts.every((a) => a.deviceId === 'dev-a'));

    const monthAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'month',
      nowMs: fixedNow,
    });
    assert.equal(monthAll.totalBlocks, 1426 + 1250);
    assert.match(monthAll.changeBadgeText, /vs\. mes previo/);

    const yearAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'year',
      nowMs: fixedNow,
    });
    assert.equal(yearAll.totalBlocks, 1426 + 1250 + 2000);
    assert.match(yearAll.changeBadgeText, /vs\. año previo/);

    const totalAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'total',
      nowMs: fixedNow,
    });
    assert.equal(totalAll.totalBlocks, 1426 + 1250 + 2000 + 4000);
    assert.equal(totalAll.changeBadgeText, 'Acumulado histórico');
  });

  test('Ordena Últimos intentos bloqueados del más reciente al más antiguo con tiempo relativo y fuente', () => {
    const weekAll = computeActivityMetrics(sampleRecords, {
      deviceId: 'all',
      period: 'week',
      nowMs: fixedNow,
      recentLimit: 3,
    });

    assert.equal(weekAll.recentAttempts.length, 3);
    assert.equal(weekAll.recentAttempts[0].attemptedDomain, 'ejemplo-apuestas.com');
    assert.equal(weekAll.recentAttempts[0].relativeTime, 'hace 4 min');
    assert.equal(weekAll.recentAttempts[0].sourceLabel, 'LOTBA');

    assert.equal(weekAll.recentAttempts[1].attemptedDomain, 'casino-demo.net');
    assert.equal(weekAll.recentAttempts[1].relativeTime, 'hace 22 min');

    assert.equal(weekAll.recentAttempts[2].attemptedDomain, 'sitio-bloqueado.com');
    assert.equal(weekAll.recentAttempts[2].sourceLabel, 'Personalizada');
    assert.equal(formatMetricNumber(0), '0');
    assert.equal(formatRelativeAttemptTime(new Date(fixedNow - 10_000).toISOString(), fixedNow), 'hace instantes');
  });
});

describe('Pestaña Actividad — Dataset consolidado, Telemetría y Estructura UI', () => {
  test('Persiste eventos reales vía apiService.reportBlockedEvent y los incorpora a las métricas', async () => {
    await apiService.clearBlockedEvents();

    await apiService.reportBlockedEvent({
      deviceUuid: 'uuid-test-a',
      deviceId: 'dev-test-a',
      deviceName: 'Dispositivo A',
      attemptedDomain: 'apuesta-reciente-test.bet',
      sourceListType: 'CUSTOM',
    });

    const stored = await apiService.getBlockedEvents();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].attemptedDomain, 'apuesta-reciente-test.bet');
    assert.equal(stored[0].sourceListType, 'CUSTOM');

    const dataset = buildActivityDataset({
      devices: [
        {
          deviceId: 'dev-test-a',
          deviceUuid: 'uuid-test-a',
          deviceName: 'Dispositivo A',
          childName: 'Dispositivo A',
          isProtected: true,
          status: 'ACTIVE',
          blockedCount: 1,
          blocklistVersion: 4,
        },
      ],
      persistedEvents: stored,
    });

    const metrics = computeActivityMetrics(dataset, {
      deviceId: 'dev-test-a',
      period: 'week',
    });

    assert.ok(metrics.totalBlocks > 0);
    assert.equal(
      metrics.recentAttempts[0].attemptedDomain,
      'apuesta-reciente-test.bet'
    );
    assert.equal(metrics.recentAttempts[0].sourceLabel, 'Personalizada');

    await apiService.clearBlockedEvents();
  });

  test('El módulo actividad/ está modularizado y contiene los 5 bloques solicitados sin Tiempo de uso', () => {
    const actividadDir = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad'
    );
    const orchestratorSrc = fs.readFileSync(
      path.join(actividadDir, 'ActivitySection.tsx'),
      'utf8'
    );

    // Verifica que ActivitySection actúa como orquestador modular
    assert.ok(orchestratorSrc.includes('useActivityDashboard'));
    assert.ok(orchestratorSrc.includes('<ActivityFiltersBar'));
    assert.ok(orchestratorSrc.includes('<TotalBlocksCard'));
    assert.ok(orchestratorSrc.includes('<BlocksBySourceCard'));
    assert.ok(orchestratorSrc.includes('<HourlyAttemptsCard'));
    assert.ok(orchestratorSrc.includes('<RecentAttemptsCard'));
    assert.ok(orchestratorSrc.includes('<DeviceFilterSheetModal'));
    assert.ok(orchestratorSrc.includes('<PeriodFilterSheetModal'));
    assert.ok(orchestratorSrc.includes('<AllBlockedAttemptsModal'));

    // Verifica todos los textos y bloques en los subcomponentes del módulo
    const moduleFiles = [
      'ActivitySection.tsx',
      'ActivityFiltersBar.tsx',
      'TotalBlocksCard.tsx',
      'BlocksBySourceCard.tsx',
      'HourlyAttemptsCard.tsx',
      'BlockedAttemptRow.tsx',
      'RecentAttemptsCard.tsx',
      'DeviceFilterSheetModal.tsx',
      'PeriodFilterSheetModal.tsx',
      'AllBlockedAttemptsModal.tsx',
    ];
    const combinedSource = moduleFiles
      .map((file) => fs.readFileSync(path.join(actividadDir, file), 'utf8'))
      .join('\n');

    assert.equal(combinedSource.includes('Filtrar por dispositivo'), true);
    assert.equal(combinedSource.includes('Seleccionar período'), true);
    assert.equal(combinedSource.includes('Bloqueos totales'), true);
    assert.equal(combinedSource.includes('Intentos de acceso frenados'), true);
    assert.equal(combinedSource.includes('Bloqueos por fuente'), true);
    assert.equal(combinedSource.includes('Lista LOTBA'), true);
    assert.equal(combinedSource.includes('Personalizada'), true);
    assert.equal(combinedSource.includes('Franja horaria de intentos'), true);
    assert.equal(combinedSource.includes('Últimos intentos bloqueados'), true);
    assert.equal(combinedSource.includes('Ver todo'), true);

    // Verifica que las pestañas antiguas de Tiempo de uso de pantalla fueron reemplazadas
    assert.equal(combinedSource.includes('Tiempo total de pantalla hoy'), false);
  });
});
