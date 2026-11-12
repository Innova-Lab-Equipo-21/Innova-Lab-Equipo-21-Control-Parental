// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Panel de Analítica (Propuesta Superadora MVP)
// Archivo: tests/analyticsPanel.test.ts
// Descripción: Valida la suite de componentes de analítica provistos por el
//              equipo de Data Analist:
//              1) Integridad de los 34 archivos del módulo analytics/ y sus exports
//              2) Tokens de color (Alto Contraste Cognitivo)
//              3) Datos de demostración y estructura de tipos
//              4) Orquestación en ParentDashboardScreen con useRealAnalyticsData
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyticsPalette } from '../src/components/dashboard/actividad/palette.js';
import {
  DEMO_DEVICES,
  DEMO_WEEK_DATA,
  DEMO_HOURLY_DATA,
  DEMO_BLOCKED_ATTEMPTS,
  DEMO_BYPASS_EVENTS,
  TEAM_TOTAL,
} from '../src/components/dashboard/actividad/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Panel de Analítica — Estructura e Integridad de Archivos (Data Analist)', () => {
  const analyticsDir = path.resolve(__dirname, '../src/components/dashboard/actividad');

  test('Todos los 34 componentes, estilos, tipos y hooks existen en disco', () => {
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
      'atomic/PillChip.tsx',
      'atomic/PillChip.styles.ts',
      'atomic/SegmentedTabs.tsx',
      'atomic/SegmentedTabs.styles.ts',
      'atomic/SourceBadge.tsx',
      'atomic/SourceBadge.styles.ts',
      'atomic/StackedBarChart.tsx',
      'atomic/StackedBarChart.styles.ts',
      'blocks/BrandHeader.tsx',
      'blocks/BrandHeader.styles.ts',
      'blocks/PanelHeader.tsx',
      'blocks/PanelHeader.styles.ts',
      'blocks/PeriodSelector.tsx',
      'blocks/PeriodSelector.styles.ts',
      'blocks/DeviceChipsRow.tsx',
      'blocks/DeviceChipsRow.styles.ts',
      'blocks/HeartbeatBanner.tsx',
      'blocks/HeartbeatBanner.styles.ts',
      'blocks/TotalBlocksCard.tsx',
      'blocks/TotalBlocksCard.styles.ts',
      'blocks/BlocksBySourceCard.tsx',
      'blocks/BlocksBySourceCard.styles.ts',
      'blocks/ActivityChartCard.tsx',
      'blocks/ActivityChartCard.styles.ts',
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

  test('Los datos de muestra coinciden exactamente con la Propuesta Superadora MVP', () => {
    assert.equal(TEAM_TOTAL.total, 1426);
    assert.equal(TEAM_TOTAL.lotba, 1045);
    assert.equal(TEAM_TOTAL.custom, 381);
    assert.equal(TEAM_TOTAL.uptime, '98.4%');

    assert.equal(DEMO_DEVICES.length, 3);
    assert.equal(DEMO_WEEK_DATA.length, 7);
    assert.equal(DEMO_HOURLY_DATA.length, 24);
    assert.equal(DEMO_BLOCKED_ATTEMPTS.length, 3);
    assert.equal(DEMO_BYPASS_EVENTS.length, 3);
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

    // 3. Destaca 'HOY' en barras diarias y horarias
    assert.ok(hookContent.includes('isToday: index === todayDayIndex'));
    assert.ok(hookContent.includes('isToday: selectedDayIndex === todayDayIndex && hourIndex === currentHour'));

    // 4. Excluye "int." ambiguo
    assert.ok(!hookContent.includes('int.`'));
    assert.ok(hookContent.includes('intentos`'));
  });
});
