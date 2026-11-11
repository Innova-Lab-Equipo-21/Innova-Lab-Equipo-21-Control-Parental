// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Modo Protegido (Adulto vs Menor) y Pasatiempos
// Archivo: tests/pasatiempos.test.ts
// Descripción: Verifica:
//              - Diferenciación de navbar entre Adulto y Menor.
//              - Cabecera "Pasatiempos" con botón Volver a Inicio y sin "cuidados".
//              - Rotación dinámica en Inicio (Quiz, Sopa de letras y Juego de la memoria).
//              - Envío al final de la lista e inactivación de juegos completados
//                (sin opción de volver a jugarlos).
//              - Integridad de Sopa de letras y Juego de la memoria con 12 piezas.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_COMPLETED_GAMES,
  MEMORY_PAIRS,
  MEMORY_TOTAL_CARDS,
  PASATIEMPOS_CATALOG,
  PASATIEMPOS_ORDER,
  SCREEN_FREE_SUGGESTION,
  WORD_SEARCH_BOARDS,
  areAllGamesCompleted,
  areMemoryCardsMatching,
  buildWordSearchGrid,
  canPlayPasatiempoGame,
  createMemoryDeck,
  findMatchingWordPlacement,
  getCompletedGamesCount,
  getNextAvailableGame,
  getOrderedPasatiemposForDisplay,
  getProtectedNavbarTabs,
  getStraightLineCells,
  getWordCells,
  isMemoryGameCompleted,
  normalizeProtectedTabForMode,
} from '../src/utils/pasatiempos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Modo Protegido — Navbar diferenciada Adulto vs Menor', () => {
  test('El modo Menor (CHILD) reemplaza "sitios" por "pasatiempos"', () => {
    const childTabs = getProtectedNavbarTabs('CHILD');
    assert.deepEqual(childTabs, ['inicio', 'pasatiempos', 'actividad', 'cuenta']);
    assert.equal(childTabs.includes('sitios'), false);
  });

  test('El modo Adulto (ADULT) mantiene "sitios" y no muestra "pasatiempos"', () => {
    const adultTabs = getProtectedNavbarTabs('ADULT');
    assert.deepEqual(adultTabs, ['inicio', 'sitios', 'actividad', 'cuenta']);
    assert.equal(adultTabs.includes('pasatiempos'), false);
  });

  test('Normaliza la pestaña activa al cambiar entre modo Menor y Adulto', () => {
    assert.equal(normalizeProtectedTabForMode('sitios', 'CHILD'), 'inicio');
    assert.equal(normalizeProtectedTabForMode('pasatiempos', 'ADULT'), 'inicio');
    assert.equal(normalizeProtectedTabForMode('pasatiempos', 'CHILD'), 'pasatiempos');
    assert.equal(normalizeProtectedTabForMode('sitios', 'ADULT'), 'sitios');
  });
});

describe('Pasatiempos — Cabecera, orden al completar e inactivación', () => {
  test('Existen exactamente los 3 juegos: Quiz, Sopa de letras y Juego de la memoria', () => {
    assert.deepEqual(PASATIEMPOS_ORDER, ['quiz', 'wordsearch', 'memory']);
    assert.equal(PASATIEMPOS_CATALOG.memory.title, 'Juego de la memoria');
  });

  test('El juego completado no puede volver a jugarse y pasa al final de la lista', () => {
    assert.deepEqual(
      getOrderedPasatiemposForDisplay(INITIAL_COMPLETED_GAMES),
      ['quiz', 'wordsearch', 'memory']
    );
    assert.equal(canPlayPasatiempoGame(INITIAL_COMPLETED_GAMES, 'quiz'), true);

    // Completa Quiz -> Quiz queda inactivo y va al final de la lista
    const afterQuiz = { quiz: true, wordsearch: false, memory: false };
    assert.equal(canPlayPasatiempoGame(afterQuiz, 'quiz'), false);
    assert.equal(canPlayPasatiempoGame(afterQuiz, 'wordsearch'), true);
    assert.deepEqual(
      getOrderedPasatiemposForDisplay(afterQuiz, ['quiz']),
      ['wordsearch', 'memory', 'quiz']
    );

    // Luego completa Juego de la memoria -> pasa al final detrás de Quiz
    const afterMemory = { quiz: true, wordsearch: false, memory: true };
    assert.equal(canPlayPasatiempoGame(afterMemory, 'memory'), false);
    assert.deepEqual(
      getOrderedPasatiemposForDisplay(afterMemory, ['quiz', 'memory']),
      ['wordsearch', 'quiz', 'memory']
    );
  });

  test('La pantalla Pasatiempos incluye botón Volver a Inicio, excluye "cuidados" y no permite "Volver a jugar"', () => {
    const screenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/ProtectedDeviceScreen.tsx'),
      'utf8'
    );
    const pasatiemposSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/menor/MenorPasatiemposSection.tsx'
      ),
      'utf8'
    );
    const wordSearchSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/juegos/WordSearchModal.tsx'
      ),
      'utf8'
    );
    const memoryModalSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/juegos/MemoryGameModal.tsx'
      ),
      'utf8'
    );

    // Header con botón Volver hacia Inicio y título exacto "Pasatiempos"
    assert.equal(screenSource.includes('title="Pasatiempos"'), true);
    assert.equal(screenSource.includes("onBack={() => setActiveTab('inicio')}"), true);

    // Palabra "cuidados" excluida de Pasatiempos y modales de juegos
    assert.equal(pasatiemposSource.includes('Pasatiempos cuidados'), false);
    assert.equal(wordSearchSource.includes('Pasatiempos cuidados'), false);
    assert.equal(memoryModalSource.includes('Pasatiempos cuidados'), false);

    // Sin opción "Volver a jugar" una vez completado
    assert.equal(pasatiemposSource.includes('Volver a jugar'), false);
  });
});

describe('Rotación dinámica de juegos en Inicio (Modo Menor)', () => {
  test('Ofrece secuencialmente un juego diferente a medida que se completan', () => {
    const step0 = getNextAvailableGame(INITIAL_COMPLETED_GAMES);
    assert.equal(step0?.id, 'quiz');
    assert.equal(getCompletedGamesCount(INITIAL_COMPLETED_GAMES), 0);

    const afterQuiz = { ...INITIAL_COMPLETED_GAMES, quiz: true };
    const step1 = getNextAvailableGame(afterQuiz);
    assert.equal(step1?.id, 'wordsearch');
    assert.equal(getCompletedGamesCount(afterQuiz), 1);

    const afterWordSearch = { ...afterQuiz, wordsearch: true };
    const step2 = getNextAvailableGame(afterWordSearch);
    assert.equal(step2?.id, 'memory');
    assert.equal(getCompletedGamesCount(afterWordSearch), 2);
  });

  test('Si el menor completa primero Sopa de letras en Pasatiempos, Inicio la saltea cuando corresponda', () => {
    const state = { quiz: false, wordsearch: true, memory: false };
    assert.equal(getNextAvailableGame(state)?.id, 'quiz');

    const afterQuiz = { ...state, quiz: true };
    assert.equal(getNextAvailableGame(afterQuiz)?.id, 'memory');
  });

  test('Al completar los 3 juegos, retorna null y sugiere salir con amigos o tareas sin pantallas', () => {
    const allDone = { quiz: true, wordsearch: true, memory: true };
    assert.equal(areAllGamesCompleted(allDone), true);
    assert.equal(getNextAvailableGame(allDone), null);
    assert.match(SCREEN_FREE_SUGGESTION.tipBody, /pasear con amigos/i);
    assert.match(SCREEN_FREE_SUGGESTION.tipBody, /sin usar pantallas/i);
  });
});

describe('Integridad de Sopa de letras y Juego de la memoria (12 piezas)', () => {
  test('Todas las palabras de los 3 tableros de Sopa de letras coinciden sin colisiones y se detectan por línea recta', () => {
    for (const board of WORD_SEARCH_BOARDS) {
      const grid = buildWordSearchGrid(board);
      assert.equal(grid.length, board.size);

      for (const placement of board.words) {
        const cells = getWordCells(placement);
        const formedWord = cells.map((c) => grid[c.row][c.col]).join('');
        assert.equal(
          formedWord,
          placement.word,
          `La palabra ${placement.word} debe leerse intacta en el tablero ${board.id}`
        );

        const start = cells[0];
        const end = cells[cells.length - 1];
        const lineForward = getStraightLineCells(start, end);
        const lineBackward = getStraightLineCells(end, start);

        assert.ok(lineForward);
        assert.ok(lineBackward);
        assert.equal(
          findMatchingWordPlacement(board, lineForward, [])?.word,
          placement.word
        );
        assert.equal(
          findMatchingWordPlacement(board, lineBackward, [])?.word,
          placement.word
        );
      }
    }
  });

  test('El Juego de la memoria contiene exactamente 12 piezas (6 pares) y valida coincidencias y victoria', () => {
    assert.equal(MEMORY_TOTAL_CARDS, 12);
    assert.equal(MEMORY_PAIRS.length, 6);

    const deck = createMemoryDeck();
    assert.equal(deck.length, 12);

    // Cada par debe aparecer exactamente 2 veces con distinto uid
    for (const pair of MEMORY_PAIRS) {
      const matchingIndices = deck
        .map((card, idx) => (card.pairId === pair.pairId ? idx : -1))
        .filter((idx) => idx !== -1);

      assert.equal(matchingIndices.length, 2);
      assert.notEqual(deck[matchingIndices[0]].uid, deck[matchingIndices[1]].uid);
      assert.equal(
        areMemoryCardsMatching(deck, matchingIndices[0], matchingIndices[1]),
        true
      );
      assert.equal(
        areMemoryCardsMatching(deck, matchingIndices[0], matchingIndices[0]),
        false
      );
    }

    assert.equal(isMemoryGameCompleted([]), false);
    assert.equal(
      isMemoryGameCompleted(MEMORY_PAIRS.slice(0, 5).map((p) => p.pairId)),
      false
    );
    assert.equal(
      isMemoryGameCompleted(MEMORY_PAIRS.map((p) => p.pairId)),
      true
    );
  });
});

describe('Modo Protegido Menor — Pantalla de Inicio replicada', () => {
  test('Incluye saludo, estado DISPOSITIVO NO PROTEGIDO, juegos dinámicos, aviso menor, Tiempo de uso y FAQ', () => {
    const menorInicioSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/menor/MenorInicioSection.tsx'
      ),
      'utf8'
    );
    const screenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/ProtectedDeviceScreen.tsx'),
      'utf8'
    );

    // 1. Saludo dinámico
    assert.equal(menorInicioSource.includes('Buenos días'), true);
    assert.equal(menorInicioSource.includes('Buenas tardes'), true);
    assert.equal(menorInicioSource.includes('Buenas noches'), true);

    // 2. Bloque "DISPOSITIVO NO PROTEGIDO" / "ESTÁS PROTEGIDO" que verifica permisos
    assert.equal(menorInicioSource.includes('DISPOSITIVO NO PROTEGIDO'), true);
    assert.equal(menorInicioSource.includes('ESTÁS PROTEGIDO'), true);
    assert.equal(menorInicioSource.includes('engrenaje.png'), true);

    // 3. NO incluye "Dispositivos protegidos"; en su lugar usa juego dinámico
    assert.equal(menorInicioSource.includes('Dispositivos protegidos'), false);
    assert.equal(menorInicioSource.includes('getNextAvailableGame'), true);

    // 4. Mantiene el bloque "SI SOS MENOR NO PODES INGRESAR."
    assert.equal(menorInicioSource.includes('SI SOS MENOR NO PODES INGRESAR.'), true);

    // 5. En lugar de "Actividad reciente", incluye "Tiempo de uso de mis apps" con CTA a Actividad
    assert.equal(menorInicioSource.includes('Actividad reciente'), false);
    assert.equal(menorInicioSource.includes('Tiempo de uso de mis apps'), true);
    assert.equal(menorInicioSource.includes('onNavigateToActivity'), true);

    // 6. Al final incluye "Ver preguntas frecuentes" conectado a FaqModal
    assert.equal(menorInicioSource.includes('Ver preguntas frecuentes'), true);
    assert.equal(screenSource.includes('onOpenFaq={() => setShowFaqModal(true)}'), true);
  });
});

describe('Modos Protegidos (Adulto y Menor) — Pestaña Cuenta replicada de Responsable', () => {
  test('Incluye Perfil, Ayuda y soporte, Información legal, Cerrar sesión y versión, excluyendo secciones exclusivas de Responsable', () => {
    const adultoCuentaSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/adulto/AdultoCuentaSection.tsx'
      ),
      'utf8'
    );
    const menorCuentaSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/menor/MenorCuentaSection.tsx'
      ),
      'utf8'
    );
    const screenSource = fs.readFileSync(
      path.resolve(__dirname, '../src/screens/ProtectedDeviceScreen.tsx'),
      'utf8'
    );

    // Header "Perfil y cuenta" con botón volver a Inicio
    assert.equal(screenSource.includes('title="Perfil y cuenta"'), true);

    for (const source of [adultoCuentaSource, menorCuentaSource]) {
      // Secciones presentes replicadas de Responsable
      assert.equal(source.includes('HelpSection'), true);
      assert.equal(source.includes('LegalSection'), true);
      assert.equal(source.includes('GlobalRulesSection'), true);
      assert.equal(source.includes('showAutoproteccion={false}'), true);
      assert.equal(source.includes('Cerrar sesión'), true);
      assert.equal(source.includes('BA Protege+ v1.0.0'), true);

      // Secciones excluidas en modos protegidos
      assert.equal(source.toLowerCase().includes('autoprotección'), false);
      assert.equal(source.toLowerCase().includes('editar perfil'), false);
      assert.equal(source.toLowerCase().includes('vincular google'), false);
      assert.equal(source.toLowerCase().includes('zona de peligro'), false);
      assert.equal(source.toLowerCase().includes('eliminar cuenta'), false);
    }
  });
});


