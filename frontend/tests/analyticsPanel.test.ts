// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Panel de Analítica (Propuesta Superadora MVP)
// Archivo: tests/analyticsPanel.test.ts
// Descripción: Valida la suite de componentes de analítica del módulo actividad/:
//              1) Integridad de los archivos activos del módulo actividad/
//              2) Tokens de color (Alto Contraste Cognitivo)
//              3) Estructuras vacías base (cero datos DEMO_) y estructura de tipos
//              4) Orquestación en ParentDashboardScreen con useRealAnalyticsData
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyticsPalette } from '../src/components/dashboard/actividad/palette.js';
import {
  EMPTY_WEEK_DATA,
  EMPTY_HOURLY_DATA,
} from '../src/components/dashboard/actividad/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Panel de Analítica — Estructura e Integridad de Archivos', () => {
  const analyticsDir = path.resolve(__dirname, '../src/components/dashboard/actividad');

  test('Todos los componentes, estilos, tipos y hooks activos existen en disco', () => {
    const requiredFiles = [
      'AnalyticsPanel.tsx',
      'AnalyticsPanel.styles.ts',
      'card.styles.ts',
      'palette.ts',
      'types.ts',
      'data.ts',
      'index.ts',
      'useRealAnalyticsData.ts',
      'hooks/useAnalyticsPanel.ts',
      'atomic/SegmentedTabs.tsx',
      'atomic/SegmentedTabs.styles.ts',
      'atomic/SourceBadge.tsx',
      'atomic/SourceBadge.styles.ts',
      'atomic/StackedBarChart.tsx',
      'atomic/StackedBarChart.styles.ts',
      'blocks/DeviceSelector.tsx',
      'blocks/DeviceSelector.styles.ts',
      'blocks/PeriodSelector.tsx',
      'blocks/PeriodSelector.styles.ts',
      'blocks/HeartbeatBanner.tsx',
      'blocks/HeartbeatBanner.styles.ts',
      'blocks/TotalBlocksCard.tsx',
      'blocks/TotalBlocksCard.styles.ts',
      'blocks/BlocksBySourceCard.tsx',
      'blocks/BlocksBySourceCard.styles.ts',
      'blocks/ActivityChartCard.tsx',
      'blocks/ActivityChartCard.styles.ts',
      'blocks/AppsUsageCard.tsx',
      'blocks/AppsUsageCard.styles.ts',
      'blocks/PasatiemposSummaryCard.tsx',
      'blocks/PasatiemposSummaryCard.styles.ts',
      'blocks/AuditEventsCard.tsx',
      'blocks/AuditEventsCard.styles.ts',
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(analyticsDir, file);
      assert.ok(fs.existsSync(fullPath), `El archivo ${file} debe existir`);
    }
  });

  test('La paleta de colores implementa Alto Contraste Cognitivo (#0284c7 vs #f59e0b)', () => {
    assert.equal(analyticsPalette.lotbaBlue, '#0284c7');
    assert.equal(analyticsPalette.customAmber, '#f59e0b');
    assert.equal(analyticsPalette.dangerRed, '#dc2626');
    assert.equal(analyticsPalette.white, '#ffffff');
  });

  test('Las estructuras vacías base están en cero y AnalyticsPanel no usa datos DEMO_', () => {
    assert.equal(EMPTY_WEEK_DATA.length, 7);
    assert.equal(EMPTY_HOURLY_DATA.length, 24);
    assert.ok(EMPTY_WEEK_DATA.every((d) => d.lotba === 0 && d.custom === 0));
    assert.ok(EMPTY_HOURLY_DATA.every((h) => h.lotba === 0 && h.custom === 0));

    const panelSrc = fs.readFileSync(
      path.join(analyticsDir, 'AnalyticsPanel.tsx'),
      'utf8'
    );
    assert.ok(!panelSrc.includes('DEMO_'));
    assert.ok(!panelSrc.includes('Mateo'));
  });

  test('ParentDashboardScreen orquesta AnalyticsPanel con los datos reales de useRealAnalyticsData', () => {
    const screenPath = path.resolve(
      __dirname,
      '../src/screens/ParentDashboardScreen.tsx'
    );
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('useRealAnalyticsData'));
    assert.ok(content.includes('<AnalyticsPanel'));
    assert.ok(content.includes('devices={realAnalytics.devices}'));
    assert.ok(content.includes('weekData={realAnalytics.weekData}'));
    assert.ok(content.includes('hourlyData={realAnalytics.hourlyData}'));
    assert.ok(content.includes('blockedAttempts={realAnalytics.blockedAttempts}'));
    assert.ok(content.includes('bypassEvents={realAnalytics.bypassEvents}'));
  });

  test('Filtro de período inicia en Hoy, persiste en AsyncStorage y destaca el día de hoy sin int.', () => {
    const hookPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/hooks/useAnalyticsPanel.ts'
    );
    const hookContent = fs.readFileSync(hookPath, 'utf8');

    // 1. Clave de persistencia en AsyncStorage
    assert.ok(hookContent.includes('STORAGE_KEY_PERIOD'));
    assert.ok(hookContent.includes('@ba_protege_actividad_period'));

    // 2. Inicia por defecto en 'today' (Hoy)
    assert.ok(hookContent.includes("useState<AnalyticsPeriod>('today')"));

    // 3. Destaca 'HOY' en selector de días y barra horaria actual
    assert.ok(hookContent.includes('isToday: index === todayDayIndex'));
    assert.ok(
      hookContent.includes(
        'isToday: selectedDayIndex === todayDayIndex && hourIndex === currentHour'
      )
    );

    // 4. Excluye "int." ambiguo
    assert.ok(!hookContent.includes('int.`'));
    assert.ok(hookContent.includes('intentos`'));
  });

  test('TotalBlocksCard muestra historial sin badge Protección activa y sin datos fake en useRealAnalyticsData', () => {
    const cardPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/blocks/TotalBlocksCard.tsx'
    );
    const cardContent = fs.readFileSync(cardPath, 'utf8');
    assert.ok(cardContent.includes('Historial de intentos a sitios bloqueados'));
    assert.ok(!cardContent.includes('Protección activa'));

    const realDataPath = path.resolve(
      __dirname,
      '../src/components/dashboard/actividad/useRealAnalyticsData.ts'
    );
    const realDataContent = fs.readFileSync(realDataPath, 'utf8');
    assert.ok(!realDataContent.includes('buildActivityDataset'));
    assert.ok(!realDataContent.includes('DEMO_BLOCKED_ATTEMPTS'));
    assert.ok(realDataContent.includes('rawBlockedEvents'));

    const screenPath = path.resolve(
      __dirname,
      '../src/screens/ParentDashboardScreen.tsx'
    );
    const screenContent = fs.readFileSync(screenPath, 'utf8');
    assert.ok(screenContent.includes('rawBlockedEvents={realAnalytics.rawBlockedEvents}'));
  });

  test('BlocksBySourceCard, ActivityChartCard y StackedBarChart cumplen el layout limpio sin pills verticales', () => {
    const sourceCard = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/blocks/BlocksBySourceCard.tsx'
      ),
      'utf8'
    );
    assert.ok(!sourceCard.includes('lotbaCount'));
    assert.ok(!sourceCard.includes('customCount'));
    assert.ok(sourceCard.includes('{lotbaPct}%'));
    assert.ok(sourceCard.includes('{customPct}%'));

    const chartCard = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/blocks/ActivityChartCard.tsx'
      ),
      'utf8'
    );
    assert.ok(!chartCard.includes('Franja horaria'));
    assert.ok(!chartCard.includes('LOTBA'));
    assert.ok(!chartCard.includes('Pers.'));
    assert.ok(chartCard.includes('Pico: ${peakInfo.range}'));

    const stackedChart = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/actividad/atomic/StackedBarChart.tsx'
      ),
      'utf8'
    );
    assert.ok(!stackedChart.includes('todayCrown'));
    assert.ok(!stackedChart.includes('styles.crown'));
  });
});
