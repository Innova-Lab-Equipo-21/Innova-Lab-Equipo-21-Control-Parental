// ==============================================================================
// Proyecto: BA Protege+
// Test Suite: activityEnhanced.test.ts
// Descripción: Valida las nuevas funcionalidades de Actividad:
//              1) Pasatiempos: registro de Quiz (correctas/incorrectas), Sopa de
//                 letras (3 sopas diferentes), Memoria (pares e intentos), Racha,
//                 precisión semanal y agregado para el Responsable.
//              2) Uso de apps bloqueadas: filtrado estricto a lista de bloqueos,
//                 orden de mayor a menor uso, totalizador y progreso individual.
//              3) Sitios y apps bloqueados: confidencialidad LOTBA ("Sitio no
//                 autorizado" / "App no autorizada") y fecha/hora (Hoy/Ayer/dd/mm/aaaa).
//              4) Estructura exacta de bloques en Responsable (6), Adulto (3) y Menor (2).
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_WORDSEARCH_TOTAL_WORDS,
  buildResponsiblePasatiemposSummary,
  computePasatiemposStreakDays,
  computeWeeklyQuizAccuracyPct,
  createEmptyDailyPasatiemposRecord,
  getOffsetDateKey,
  updateMemoryMetrics,
  updateQuizMetrics,
  updateWordSearchMetrics,
} from '../src/utils/pasatiemposMetrics.js';
import {
  buildBlockedAppsUsageSummary,
  formatDurationMinutes,
} from '../src/utils/appUsageMetrics.js';
import {
  formatAttemptDateTime,
  getDisplayTitleForBlockedAttempt,
} from '../src/utils/activityMetrics.js';
import { WORD_SEARCH_BOARDS } from '../src/utils/pasatiempos.js';
import { CustomBlockedApp, DeviceInfo } from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('1. Pasatiempos — Registro de respuestas, 3 sopas, Memoria y Racha', () => {
  test('Quiz registra respuestas correctas, incorrectas y conclusión diaria', () => {
    let rec = createEmptyDailyPasatiemposRecord('dev-menor-1', 'MENOR', '2026-11-23');
    rec = updateQuizMetrics(rec, {
      correctAnswers: 2,
      wrongAnswers: 1,
      totalQuestions: 5,
      completed: false,
    });
    assert.equal(rec.quiz.status, 'in_progress');
    assert.equal(rec.quiz.correctAnswers, 2);
    assert.equal(rec.quiz.wrongAnswers, 1);

    rec = updateQuizMetrics(rec, {
      correctAnswers: 4,
      wrongAnswers: 1,
      totalQuestions: 5,
      completed: true,
    });
    assert.equal(rec.quiz.status, 'completed');
    assert.equal(rec.quiz.accuracyPct, 80);
  });

  test('Sopa de letras mide encontradas y faltantes en las 3 sopas diferentes', () => {
    assert.equal(WORD_SEARCH_BOARDS.length, 3);
    assert.equal(DEFAULT_WORDSEARCH_TOTAL_WORDS, 20); // 8 + 6 + 6

    let rec = createEmptyDailyPasatiemposRecord('dev-menor-1', 'MENOR', '2026-11-23');
    // Completa solo la primera sopa (planetas = 8 palabras) y 2 de salud
    rec = updateWordSearchMetrics(rec, {
      planetas: WORD_SEARCH_BOARDS[0].words.map((w) => w.word),
      salud: WORD_SEARCH_BOARDS[1].words.slice(0, 2).map((w) => w.word),
      valores: [],
    });

    assert.equal(rec.wordsearch.status, 'in_progress');
    assert.equal(rec.wordsearch.foundWordsTotal, 10);
    assert.equal(rec.wordsearch.missingWordsTotal, 10);
    assert.equal(rec.wordsearch.completedBoardsCount, 1);
    assert.equal(rec.wordsearch.boards[0].completed, true);
    assert.equal(rec.wordsearch.boards[1].foundCount, 2);
    assert.equal(rec.wordsearch.boards[1].missingCount, 4);
    assert.equal(rec.wordsearch.boards[2].foundCount, 0);
    assert.equal(rec.wordsearch.boards[2].missingCount, 6);

    // Completa las 3 sopas
    rec = updateWordSearchMetrics(rec, {
      planetas: WORD_SEARCH_BOARDS[0].words.map((w) => w.word),
      salud: WORD_SEARCH_BOARDS[1].words.map((w) => w.word),
      valores: WORD_SEARCH_BOARDS[2].words.map((w) => w.word),
    });

    assert.equal(rec.wordsearch.status, 'completed');
    assert.equal(rec.wordsearch.foundWordsTotal, 20);
    assert.equal(rec.wordsearch.missingWordsTotal, 0);
    assert.equal(rec.wordsearch.completedBoardsCount, 3);
    assert.equal(rec.wordsearch.accuracyPct, 100);
  });

  test('Juego de la memoria mide pares encontrados, faltantes e intentos', () => {
    let rec = createEmptyDailyPasatiemposRecord('dev-menor-1', 'MENOR', '2026-11-23');
    rec = updateMemoryMetrics(rec, {
      matchedPairs: 3,
      totalPairs: 6,
      attempts: 7,
    });
    assert.equal(rec.memory.status, 'in_progress');
    assert.equal(rec.memory.matchedPairs, 3);
    assert.equal(rec.memory.unmatchedPairs, 3);
    assert.equal(rec.memory.attempts, 7);

    rec = updateMemoryMetrics(rec, {
      matchedPairs: 6,
      totalPairs: 6,
      attempts: 14,
      completed: true,
    });
    assert.equal(rec.memory.status, 'completed');
    assert.equal(rec.memory.unmatchedPairs, 0);
    assert.equal(rec.memory.attempts, 14);
  });

  test('Calcula Racha en días consecutivos y porcentaje semanal de aciertos', () => {
    const today = '2026-11-23';
    const d1 = getOffsetDateKey(today, 1);
    const d2 = getOffsetDateKey(today, 2);

    const makeAdultDay = (dateKey: string, correct: number) =>
      updateQuizMetrics(
        createEmptyDailyPasatiemposRecord('dev-adult-1', 'ADULTO', dateKey),
        {
          correctAnswers: correct,
          wrongAnswers: 5 - correct,
          totalQuestions: 5,
          completed: true,
        }
      );

    const history = [
      makeAdultDay(today, 4), // 4/5
      makeAdultDay(d1, 5),    // 5/5
      makeAdultDay(d2, 3),    // 3/5
    ];

    assert.equal(computePasatiemposStreakDays(history, 'ADULTO', today), 3);
    // (4 + 5 + 3) / 15 = 80%
    assert.equal(computeWeeklyQuizAccuracyPct(history, today), 80);
  });

  test('Resumen para el Responsable agrupa Menores y Mayores de edad y respeta filtro por dispositivo', () => {
    const devices: DeviceInfo[] = [
      {
        deviceId: 'dev-tomas',
        deviceUuid: 'dev-tomas',
        deviceName: 'Tomás García',
        childName: 'Tomás García',
        isProtected: true,
        status: 'ACTIVE',
        profileType: 'Menor',
      },
      {
        deviceId: 'dev-sol',
        deviceUuid: 'dev-sol',
        deviceName: 'Sol Pérez',
        childName: 'Sol Pérez',
        isProtected: true,
        status: 'ACTIVE',
        profileType: 'Adulto',
      },
    ];

    let tomasRec = createEmptyDailyPasatiemposRecord('dev-tomas', 'MENOR', '2026-11-23');
    tomasRec = updateQuizMetrics(tomasRec, {
      correctAnswers: 4,
      wrongAnswers: 1,
      totalQuestions: 5,
      completed: true,
    });
    tomasRec = updateMemoryMetrics(tomasRec, {
      matchedPairs: 6,
      totalPairs: 6,
      attempts: 12,
      completed: true,
    });

    const solRec = updateQuizMetrics(
      createEmptyDailyPasatiemposRecord('dev-sol', 'ADULTO', '2026-11-23'),
      { correctAnswers: 4, wrongAnswers: 1, totalQuestions: 5, completed: true }
    );

    const summary = buildResponsiblePasatiemposSummary({
      devices,
      recordsByDeviceId: { 'dev-tomas': tomasRec, 'dev-sol': solRec },
      streakByDeviceId: { 'dev-tomas': 4, 'dev-sol': 6 },
      weeklyQuizPctByDeviceId: { 'dev-tomas': 85, 'dev-sol': 77 },
      selectedDeviceId: 'all',
    });

    assert.equal(summary.menores.deviceCount, 1);
    assert.equal(summary.menores.chips[0].completedCount, 2);
    assert.equal(summary.menores.devices.length, 1);
    assert.equal(summary.menores.devices[0].label, 'Tomás');
    assert.equal(summary.menores.devices[0].quiz.correctAnswers, 4);
    assert.equal(summary.menores.devices[0].quiz.status, 'completed');
    assert.equal(summary.menores.devices[0].wordsearch.status, 'pending');
    assert.equal(summary.menores.devices[0].memory.matchedPairs, 6);
    assert.equal(summary.menores.devices[0].streakDays, 4);
    assert.equal(summary.menores.devices[0].weeklyAccuracyPct, 85);
    assert.equal(summary.menores.bestStreakDays, 4);
    assert.equal(summary.menores.weeklyAccuracyPct, 85);
    assert.equal(summary.menores.quiz.completedDevices, 1);
    assert.equal(summary.menores.quiz.status, 'completed');
    assert.equal(summary.menores.wordsearch.status, 'pending');
    assert.equal(summary.menores.memory.status, 'completed');
    assert.equal(summary.menores.memory.avgAttempts, 12);

    assert.equal(summary.adultos.deviceCount, 1);
    assert.equal(summary.adultos.devices.length, 1);
    assert.equal(summary.adultos.devices[0].label, 'Sol');
    assert.equal(summary.adultos.devices[0].correctToday, 4);
    assert.equal(summary.adultos.devices[0].status, 'completed');
    assert.equal(summary.adultos.devices[0].streakDays, 6);
    assert.equal(summary.adultos.devices[0].weeklyAccuracyPct, 77);
    assert.equal(summary.adultos.status, 'completed');
    assert.equal(summary.adultos.completedDevices, 1);
    assert.equal(summary.adultos.correctToday, 4);
    assert.equal(summary.adultos.streakDays, 6);
    assert.equal(summary.adultos.weeklyAccuracyPct, 77);
  });
});

describe('2. Uso de apps bloqueadas — Filtrado, orden descendente y totalizador', () => {
  test('Incluye solo apps de la lista de bloqueos, ordena de mayor a menor uso y calcula el totalizador', () => {
    const customApps: CustomBlockedApp[] = [
      {
        id: 'app-yt',
        appName: 'YouTube',
        packageName: 'com.google.android.youtube',
        dailyLimitMinutes: 90,
        applyToAll: true,
        isActive: true,
      },
      {
        id: 'app-ig',
        appName: 'Instagram',
        packageName: 'com.instagram.android',
        dailyLimitMinutes: 120,
        applyToAll: true,
        isActive: true,
      },
      {
        id: 'app-tt',
        appName: 'TikTok',
        packageName: 'com.zhiliaoapp.musically',
        dailyLimitMinutes: 60,
        applyToAll: true,
        isActive: true,
      },
    ];

    const summary = buildBlockedAppsUsageSummary({
      customApps,
      usageSnapshots: [
        { deviceId: 'dev-1', packageName: 'com.whatsapp', appName: 'WhatsApp', usedMinutes: 300 }, // NO está en la lista -> ignorada
        { deviceId: 'dev-1', packageName: 'com.google.android.youtube', appName: 'YouTube', usedMinutes: 35 },
        { deviceId: 'dev-1', packageName: 'com.instagram.android', appName: 'Instagram', usedMinutes: 115 },
        { deviceId: 'dev-1', packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', usedMinutes: 60 },
      ],
      deviceId: 'dev-1',
    });

    assert.equal(summary.appsCount, 3);
    // Orden estricto de mayor a menor consumo: Instagram (115) -> TikTok (60) -> YouTube (35)
    assert.deepEqual(
      summary.items.map((i) => i.appName),
      ['Instagram', 'TikTok', 'YouTube']
    );
    assert.equal(summary.items[0].remainingMinutes, 5);
    assert.equal(summary.items[1].statusType, 'waiting'); // 60/60 límite alcanzado
    assert.equal(summary.items[2].remainingMinutes, 55);

    // Totalizador
    assert.equal(summary.totalUsedMinutes, 210); // 115 + 60 + 35
    assert.equal(summary.totalLimitMinutes, 270); // 120 + 60 + 90
    assert.equal(summary.totalRemainingMinutes, 60); // 5 + 0 + 55
    assert.equal(formatDurationMinutes(210), '3 h 30 min');
    assert.equal(summary.items[0].deviceBreakdowns.length, 0);
  });

  test('En modo Todos incluye desglose por dispositivo listado y AppsUsageCard/PasatiemposSummaryCard eliminan íconos de títulos/apps y subtítulo', () => {
    const customApps: CustomBlockedApp[] = [
      {
        id: 'app-tg',
        appName: 'Telegram',
        packageName: 'org.telegram.messenger',
        dailyLimitMinutes: 120,
        applyToAll: true,
        isActive: true,
      },
      {
        id: 'app-ig',
        appName: 'Instagram',
        packageName: 'com.instagram.android',
        dailyLimitMinutes: null,
        applyToAll: false,
        deviceIds: ['self', 'dev-ariana'],
        isActive: true,
      },
    ];

    const targetDevices = [
      { id: 'self', label: 'Yo', color: '#007AFF' },
      { id: 'dev-ariana', label: 'Ariana', color: '#28A745' },
      { id: 'dev-cesar', label: 'Cesar', color: '#7E22CE' },
    ];

    const summary = buildBlockedAppsUsageSummary({
      customApps,
      usageSnapshots: [
        { deviceId: 'self', packageName: 'org.telegram.messenger', appName: 'Telegram', usedMinutes: 30 },
        { deviceId: 'dev-ariana', packageName: 'org.telegram.messenger', appName: 'Telegram', usedMinutes: 60 },
      ],
      deviceId: 'all',
      targetDevices,
    });

    const tg = summary.items.find((i) => i.appName === 'Telegram')!;
    const ig = summary.items.find((i) => i.appName === 'Instagram');

    assert.equal(tg.usedMinutes, 90);
    assert.equal(tg.dailyLimitMinutes, 360); // 120 * 3 dispositivos
    assert.deepEqual(
      tg.deviceBreakdowns.map((d) => d.label),
      ['Yo', 'Ariana', 'Cesar']
    );
    assert.equal(tg.deviceBreakdowns[0].usedMinutes, 30);
    assert.equal(tg.deviceBreakdowns[1].usedMinutes, 60);
    assert.equal(tg.deviceBreakdowns[2].usedMinutes, 0);

    // Instagram tiene bloqueo total (100% bloqueada) -> no debe listarse en Uso de apps
    assert.equal(ig, undefined);
    assert.equal(summary.appsCount, 1);

    const appsCardSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/components/dashboard/actividad/blocks/AppsUsageCard.tsx'),
      'utf8'
    );
    assert.equal(appsCardSrc.includes('📱'), false);
    assert.equal(appsCardSrc.includes('Solo las apps elegidas'), false);
    assert.equal(appsCardSrc.includes('apps elegidas'), false);
    assert.equal(appsCardSrc.includes('Consumo total de hoy'), false);
    assert.equal(appsCardSrc.includes('consumidos hoy'), true);
    assert.equal(appsCardSrc.includes('appAvatar'), false);
    assert.equal(appsCardSrc.includes('deviceBreakdowns'), true);

    const pasatiemposSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/blocks/PasatiemposSummaryCard.tsx'
      ),
      'utf8'
    );
    assert.equal(pasatiemposSrc.includes('⭐'), false);
    assert.equal(pasatiemposSrc.includes('(3 sopas)'), false);
    assert.equal(pasatiemposSrc.includes('Terminaron hoy'), false);
    assert.equal(pasatiemposSrc.includes('Aciertos hoy'), false);
    assert.equal(pasatiemposSrc.includes('Salud digital'), false);
    assert.equal(pasatiemposSrc.includes('de aciertos'), false);
    assert.equal(pasatiemposSrc.includes('de palabras'), false);
    assert.equal(pasatiemposSrc.includes('intentos prom.'), false);
    assert.equal(pasatiemposSrc.includes('No iniciado'), true);
    assert.equal(pasatiemposSrc.includes('En curso'), true);
    assert.equal(pasatiemposSrc.includes('Completado'), true);
    assert.equal(pasatiemposSrc.includes('carouselItems'), true);
    assert.equal(pasatiemposSrc.includes('En la semana'), true);
    assert.equal(pasatiemposSrc.includes('summary.menores.devices.map'), true);
    assert.equal(pasatiemposSrc.includes('summary.adultos.devices.map'), true);
  });
});

describe('3. Sitios y apps bloqueados — LOTBA confidencial y fecha/hora', () => {
  test('Muestra Sitio no autorizado o App no autorizada para LOTBA y nombres reales para Personalizada', () => {
    assert.equal(
      getDisplayTitleForBlockedAttempt('bet365-ilegal.com', 'LOTBA', 'site'),
      'Sitio no autorizado'
    );
    assert.equal(
      getDisplayTitleForBlockedAttempt('Apuestas Ya', 'LOTBA', 'app'),
      'App no autorizada'
    );
    assert.equal(
      getDisplayTitleForBlockedAttempt('sitio-bloqueado.com', 'CUSTOM', 'site'),
      'sitio-bloqueado.com'
    );
    assert.equal(
      getDisplayTitleForBlockedAttempt('Instagram', 'CUSTOM', 'app'),
      'Instagram'
    );
  });

  test('Formatea fecha como Hoy, Ayer o dd/mm/aaaa junto con horario hh:mm', () => {
    const now = new Date(2026, 10, 23, 15, 30, 0).getTime(); // 23/11/2026 15:30
    const todayEvent = new Date(2026, 10, 23, 9, 5, 0).toISOString();
    const yesterdayEvent = new Date(2026, 10, 22, 18, 2, 0).toISOString();
    const olderEvent = new Date(2026, 10, 19, 23, 40, 0).toISOString();

    assert.equal(formatAttemptDateTime(todayEvent, now), 'Hoy · 09:05');
    assert.equal(formatAttemptDateTime(yesterdayEvent, now), 'Ayer · 18:02');
    assert.equal(formatAttemptDateTime(olderEvent, now), '19/11/2026 · 23:40');
  });
});

describe('4. Estructura y orden de bloques en Actividad (Responsable, Adulto y Menor)', () => {
  test('Responsable mantiene 6 bloques en orden y remueve "Por día (Sem)"', () => {
    const panelSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/components/dashboard/actividad/AnalyticsPanel.tsx'),
      'utf8'
    );
    const chartSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/components/dashboard/actividad/blocks/ActivityChartCard.tsx'),
      'utf8'
    );

    const idxFilters = panelSrc.indexOf('<DeviceSelector');
    const idxTotal = panelSrc.indexOf('<TotalBlocksCard');
    const idxSource = panelSrc.indexOf('<BlocksBySourceCard');
    const idxApps = panelSrc.indexOf('<AppsUsageCard');
    const idxPasatiempos = panelSrc.indexOf('<PasatiemposSummaryCard');
    const idxAudit = panelSrc.indexOf('<AuditEventsCard');

    assert.ok(idxFilters > 0);
    assert.ok(idxFilters < idxTotal);
    assert.ok(idxTotal < idxSource);
    assert.ok(idxSource < idxAudit);
    assert.ok(idxAudit < idxApps);
    assert.ok(idxApps < idxPasatiempos);

    assert.equal(chartSrc.includes('Por día (Sem)'), false);
    assert.equal(chartSrc.includes('Franja horaria'), false);
    assert.equal(chartSrc.includes('Pico: ${peakInfo.range}'), true);
  });

  test('Protegido Adulto contiene exactamente 3 bloques en orden estilo Responsable: Tiempo de uso de las aplicaciones, Historial (solo Historial de toda la actividad) y Pasatiempos', () => {
    const adultSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoActividadSection.tsx'
      ),
      'utf8'
    );
    const appsCardSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/blocks/AppsUsageCard.tsx'
      ),
      'utf8'
    );
    const jsxStart = adultSrc.indexOf('return (');
    const jsxBody = adultSrc.slice(jsxStart);

    const idxApps = jsxBody.indexOf('title="Tiempo de uso de las aplicaciones"');
    const idxHistory = jsxBody.indexOf(
      'Historial de intentos de acceso a sitios y apps bloqueados'
    );
    const idxAudit = jsxBody.indexOf('<AuditEventsCard');
    const idxPasatiempos = jsxBody.indexOf('<PasatiemposSummaryCard');

    assert.ok(idxApps > 0);
    assert.ok(idxApps < idxHistory);
    assert.ok(idxHistory < idxAudit);
    assert.ok(idxAudit < idxPasatiempos);
    assert.equal(jsxBody.includes('TotalBlocksCard'), false);
    assert.equal(jsxBody.includes('BlocksBySourceCard'), false);

    // Copys específicos de Protegido Adulto en AppsUsageCard
    assert.equal(
      appsCardSrc.includes(
        'Todavía no estableciste un límite de tiempo de uso para las aplicaciones. Podés hacerlo desde “Sitios y apps”.'
      ),
      true
    );
    assert.equal(
      appsCardSrc.includes(
        'Hoy usaste ${activeApp.appName} durante ${usedText}. Dentro de ${remainingText} se bloqueará la aplicación para mantener activa la protección.'
      ),
      true
    );
  });

  test('Protegido Menor contiene exactamente 2 bloques en orden: Mis apps hoy (estilo Responsable) y Mis pasatiempos', () => {
    const childSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/menor/MenorActividadSection.tsx'
      ),
      'utf8'
    );
    const appsCardSrc = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/blocks/AppsUsageCard.tsx'
      ),
      'utf8'
    );
    const jsxStart = childSrc.indexOf('return (');
    const jsxBody = childSrc.slice(jsxStart);

    const idxApps = jsxBody.indexOf('title="Mis apps hoy"');
    const idxPasatiempos = jsxBody.indexOf('>Mis pasatiempos<');

    assert.ok(idxApps > 0);
    assert.ok(idxApps < idxPasatiempos);
    assert.equal(jsxBody.includes('Sitios y apps bloqueados'), false);
    assert.equal(jsxBody.includes('/3 completados'), false);
    assert.equal(jsxBody.includes('>Quiz<'), false);
    assert.ok(jsxBody.includes('>Juego de preguntas<'));
    assert.ok(jsxBody.includes('Sopa de letras'));
    assert.ok(jsxBody.includes('Juego de la memoria'));
    assert.ok(jsxBody.includes('wordsearch.boards.map'));
    assert.ok(jsxBody.includes("? 'correcta' : 'correctas'"));
    assert.ok(jsxBody.includes("? 'incorrecta' : 'incorrectas'"));
    assert.ok(jsxBody.includes("? 'encontrada' : 'encontradas'"));
    assert.ok(jsxBody.includes("? 'faltante' : 'faltantes'"));
    assert.ok(jsxBody.includes("? 'par encontrado' : 'pares encontrados'"));
    assert.ok(jsxBody.includes("? 'intento' : 'intentos'"));

    // Copys específicos de Protegido Menor en AppsUsageCard
    assert.equal(
      appsCardSrc.includes(
        'La persona responsable de tu cuenta todavía no estableció un límite de tiempo de uso para las aplicaciones.'
      ),
      true
    );
    assert.equal(
      appsCardSrc.includes(
        'Hoy usaste ${activeApp.appName} durante ${usedText}. Dentro de ${remainingText} se bloqueará la aplicación para cuidar tu bienestar digital.'
      ),
      true
    );
  });
});
