// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Módulo 5 (Modo Protegido, Pasatiempos y Ayuda)
// Archivo: tests/protectedModule5.test.ts
// Descripción: Verifica:
//              - Eliminación total del fallback ficticio "Ana" en Cuenta y hooks.
//              - Hidratación del perfil real pareado (@ba_protege_paired_profile y teléfono).
//              - Preservación de completedAt y orden de conclusión en Pasatiempos.
//              - Manejo seguro de Linking.openURL en HelpSection y FaqModal.
// ==============================================================================

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hydrateDailyRecordFromSessions } from '../src/utils/pasatiemposMetrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Módulo 5 — Modo Protegido (Menor y Adulto), Pasatiempos y Ayuda', () => {
  test('Elimina fallback "Ana" en Cuenta y hooks e hidrata perfil/teléfono real desde PostgreSQL', () => {
    const menorCuentaSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/menor/MenorCuentaSection.tsx'
      ),
      'utf8'
    );
    const adultoCuentaSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoCuentaSection.tsx'
      ),
      'utf8'
    );
    const deviceDataSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/hooks/useProtectedDeviceData.ts'
      ),
      'utf8'
    );

    for (const source of [menorCuentaSource, adultoCuentaSource]) {
      assert.equal(source.includes("= 'Ana'"), false);
      assert.equal(source.includes("= 'tu responsable'"), true);
    }

    assert.equal(deviceDataSource.includes("useState<string>('Ana')"), false);
    assert.equal(deviceDataSource.includes('@ba_protege_paired_profile'), true);
    assert.equal(deviceDataSource.includes('publicProfile?.phone'), true);
  });

  test('useProtectedPasatiempos reconstruye orden de completados y usa racha/precisión del servidor', () => {
    const pasatiemposHookSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/hooks/useProtectedPasatiempos.ts'
      ),
      'utf8'
    );
    const telemetryApiSource = fs.readFileSync(
      path.resolve(__dirname, '../src/services/api/telemetry.api.ts'),
      'utf8'
    );

    assert.equal(pasatiemposHookSource.includes('deriveCompletedGamesOrder'), true);
    assert.equal(pasatiemposHookSource.includes('remoteStreakDays'), true);
    assert.equal(pasatiemposHookSource.includes('remoteWeeklyQuizAccuracyPct'), true);
    assert.equal(telemetryApiSource.includes('streakDays?: number'), true);
    assert.equal(telemetryApiSource.includes('weeklyQuizAccuracyPct?: number'), true);
  });

  test('hydrateDailyRecordFromSessions preserva completedAt, updatedAt y WORDSEARCH COMPLETED sin details', () => {
    const hydrated = hydrateDailyRecordFromSessions('dev-1', 'MENOR', '2026-06-10', [
      {
        deviceId: 'dev-1',
        dateKey: '2026-06-10',
        gameType: 'QUIZ',
        status: 'COMPLETED',
        correctCount: 4,
        wrongCount: 1,
        totalItems: 5,
        attempts: 5,
        completedAt: '2026-06-10T10:15:00.000Z',
        updatedAt: '2026-06-10T10:15:00.000Z',
      },
      {
        deviceId: 'dev-1',
        dateKey: '2026-06-10',
        gameType: 'WORDSEARCH',
        status: 'COMPLETED',
        correctCount: 0,
        wrongCount: 0,
        totalItems: 20,
        attempts: 20,
        details: null,
        completedAt: '2026-06-10T10:25:00.000Z',
        updatedAt: '2026-06-10T10:25:00.000Z',
      },
      {
        deviceId: 'dev-1',
        dateKey: '2026-06-10',
        gameType: 'MEMORY',
        status: 'COMPLETED',
        correctCount: 6,
        wrongCount: 0,
        totalItems: 6,
        attempts: 8,
        completedAt: '2026-06-10T10:30:00.000Z',
        updatedAt: '2026-06-10T10:30:00.000Z',
      },
    ]);

    assert.equal(hydrated.quiz.status, 'completed');
    assert.equal(hydrated.quiz.completedAt, '2026-06-10T10:15:00.000Z');
    assert.equal(hydrated.wordsearch.status, 'completed');
    assert.equal(hydrated.wordsearch.foundWordsTotal, 20);
    assert.equal(hydrated.wordsearch.completedAt, '2026-06-10T10:25:00.000Z');
    assert.equal(hydrated.memory.status, 'completed');
    assert.equal(hydrated.memory.completedAt, '2026-06-10T10:30:00.000Z');
    assert.equal(hydrated.updatedAt, '2026-06-10T10:30:00.000Z');
  });

  test('HelpSection y FaqModal protegen todos los enlaces externos Linking.openURL con .catch()', () => {
    const helpSectionSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/cuenta/HelpSection.tsx'
      ),
      'utf8'
    );
    const faqModalSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/cuenta/FaqModal.tsx'
      ),
      'utf8'
    );

    const helpOpenUrlCount = (helpSectionSource.match(/Linking\.openURL\(/g) || []).length;
    const helpCatchCount = (helpSectionSource.match(/Linking\.openURL\([^)]+\)\.catch\(/g) || []).length;
    assert.equal(helpOpenUrlCount, 4);
    assert.equal(helpCatchCount, 4);
    assert.equal(faqModalSource.includes('.catch('), true);
  });
});
