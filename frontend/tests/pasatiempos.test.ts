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
  test('Existen exactamente los 3 juegos: Juego de preguntas, Sopa de letras y Juego de la memoria en Sentence case', () => {
    assert.deepEqual(PASATIEMPOS_ORDER, ['quiz', 'wordsearch', 'memory']);
    assert.equal(PASATIEMPOS_CATALOG.quiz.title, 'Juego de preguntas');
    assert.equal(PASATIEMPOS_CATALOG.wordsearch.title, 'Sopa de letras');
    assert.equal(PASATIEMPOS_CATALOG.memory.title, 'Juego de la memoria');
    assert.equal(
      PASATIEMPOS_CATALOG.wordsearch.homeBannerTitle,
      '¿Jugamos una sopa de letras?'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.wordsearch.homeBannerSubtitle,
      'Encontrá las palabras escondidas y divertite aprendiendo sobre los planetas, hábitos de salud y valores humanos.'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.memory.homeBannerTitle,
      '¿Hacemos el juego de la memoria?'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.memory.homeBannerSubtitle,
      'Da vuelta las tarjetas y encontrá los pares iguales. ¡A ver cómo te va!'
    );
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

    // Sin opción "Volver a jugar", sin badge verde de completado, y botón Completado
    assert.equal(pasatiemposSource.includes('Volver a jugar'), false);
    assert.equal(pasatiemposSource.includes('completedPill'), false);
    assert.equal(pasatiemposSource.includes('>Completado<'), true);
    assert.equal(pasatiemposSource.includes('>Comenzar<'), true);
    assert.equal(
      PASATIEMPOS_CATALOG.quiz.cardDescription,
      'Cinco preguntas sobre cómo navegar de forma segura en internet, mantener hábitos digitales saludables y cómo protegerse de sitios y aplicaciones de apuestas ilegales.'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.wordsearch.cardDescription,
      'Tres sopas temáticas para encontrar palabras sobre planetas, hábitos de salud y cualidades humanas.'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.memory.cardDescription,
      'Descubrí las tarjetas y poné a prueba tu memoria encontrando los pares iguales.'
    );
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

  test('Al completar los 3 juegos, retorna null y sugiere alejarse de las pantallas', () => {
    const allDone = { quiz: true, wordsearch: true, memory: true };
    assert.equal(areAllGamesCompleted(allDone), true);
    assert.equal(getNextAvailableGame(allDone), null);
    assert.equal(
      SCREEN_FREE_SUGGESTION.title,
      'Ya completaste todos los pasatiempos. ¡Muy bien!'
    );
    assert.equal(
      SCREEN_FREE_SUGGESTION.subtitle,
      'Ahora es un buen momento para alejarse de las pantallas.'
    );
    assert.equal(
      SCREEN_FREE_SUGGESTION.tipBody,
      'Podés salir a pasear o distraerte con otra actividad.'
    );
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
  test('Incluye saludo, estado Dispositivo protegido/no protegido, juegos dinámicos, aviso menor, Mis apps hoy y FAQ sin badge PERFIL MENOR', () => {
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

    // 0. No muestra el badge PERFIL MENOR ni el contador /3 completados en los headers
    assert.equal(screenSource.includes('PERFIL MENOR'), false);
    assert.equal(screenSource.includes('/3 completados'), false);

    // 1. Saludo dinámico replicado de Protegido Adulto / Responsable
    assert.equal(menorInicioSource.includes('Buenos días'), true);
    assert.equal(menorInicioSource.includes('Buenas tardes'), true);
    assert.equal(menorInicioSource.includes('Buenas noches'), true);
    assert.equal(menorInicioSource.includes('`¡${prefix}, ${firstName}!`'), true);

    // 2. Bloque "Dispositivo no protegido" / "Dispositivo protegido" con escudo y textos de Protegido Adulto
    assert.equal(menorInicioSource.includes('Dispositivo no protegido'), true);
    assert.equal(menorInicioSource.includes('Dispositivo protegido'), true);
    assert.equal(
      menorInicioSource.includes(
        'Bloqueamos de forma automática sitios y aplicaciones de apuestas ilegales no autorizados por LOTBA. Estás navegando de forma segura.'
      ),
      true
    );
    assert.equal(menorInicioSource.includes('tintColor: isProtected ? colors.primaryDark'), true);
    assert.equal(menorInicioSource.includes('engrenaje.png'), true);

    // 3. NO incluye "Dispositivos protegidos" ni badge "de 3 pasatiempos completados"; usa juego dinámico con nuevo copy y CTA "Empezar"
    assert.equal(menorInicioSource.includes('Dispositivos protegidos'), false);
    assert.equal(menorInicioSource.includes('de 3 pasatiempos completados'), false);
    assert.equal(menorInicioSource.includes('getNextAvailableGame'), true);
    assert.equal(menorInicioSource.includes('Empezar'), true);
    assert.equal(
      PASATIEMPOS_CATALOG.quiz.homeBannerTitle,
      '¿Hacemos un juego de preguntas?'
    );
    assert.equal(
      PASATIEMPOS_CATALOG.quiz.homeBannerSubtitle,
      'Poné a prueba tus conocimientos sobre la navegación digital de forma divertida.'
    );

    // 4. Bloque educativo actualizado para menores y modal Protección de navegación segura
    assert.equal(
      menorInicioSource.includes('Cuidado con los sitios y apps de adultos'),
      true
    );
    assert.equal(
      menorInicioSource.includes(
        'Recordá que si sos menor de edad, no podés entrar a sitios o aplicaciones de apuestas ni ver contenido para adultos. En cambio, podés hacer actividades al aire libre o charlar en casa sobre lo que te pase.'
      ),
      true
    );
    assert.equal(menorInicioSource.includes('>Saber más<'), true);
    assert.equal(
      menorInicioSource.includes(
        'Los sitios y las aplicaciones de apuestas no están permitidos para menores de 18 años. Esto es para cuidar tu bienestar. Si tenés dudas, podés charlar en casa sobre el tema o con la persona responsable de tu cuenta.'
      ),
      true
    );
    // CTAs de Inicio sin flechas
    assert.equal(menorInicioSource.includes('➔'), false);

    // 5. Reemplaza el card final por el Bloque 1 (Mis apps hoy) con CTA Ver más a Actividad
    assert.equal(menorInicioSource.includes('Actividad reciente'), false);
    assert.equal(menorInicioSource.includes('<AppsUsageCard'), true);
    assert.equal(menorInicioSource.includes('variant="child"'), true);
    assert.equal(menorInicioSource.includes('title="Mis apps hoy"'), true);
    assert.equal(menorInicioSource.includes('actionLabel="Ver más"'), true);
    assert.equal(menorInicioSource.includes('onActionPress={onNavigateToActivity}'), true);

    // 6. Al final incluye "Ver preguntas frecuentes" conectado a FaqModal
    assert.equal(menorInicioSource.includes('Ver preguntas frecuentes'), true);
    assert.equal(screenSource.includes('onOpenFaq={() => setShowFaqModal(true)}'), true);
  });

  test('Juego de preguntas (Menor) usa contador en sentence case, preguntas actualizadas y feedbacks sin emojis', () => {
    const quizModalSource = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/components/dashboard/protected/juegos/QuizModal.tsx'
      ),
      'utf8'
    );

    // Contador en sentence case
    assert.equal(
      quizModalSource.includes('Pregunta {currentStepIndex + 1} de {preparedQuestions.length}'),
      true
    );

    // Preguntas y opciones actualizadas de Menor
    assert.equal(
      quizModalSource.includes(
        'Recordá que navegar en internet de forma segura implica proteger tu información personal.'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes('No respondo y le aviso a una persona adulta de confianza.'),
      true
    );
    assert.equal(
      quizModalSource.includes('Recordá qué ganás cuando te alejás un momento del celular.'),
      true
    );
    assert.equal(
      quizModalSource.includes(
        '¿Se puede jugar a apostar plata en páginas de internet y aplicaciones cuando uno es menor de 18 años?'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes('Recordá que hay espacios pensados según la edad de cada persona.'),
      true
    );
    assert.equal(quizModalSource.includes('No, está prohibido'), true);
    assert.equal(
      quizModalSource.includes(
        '¿Qué podés hacer si te sentís cansado o con ganas de dejar el celular?'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes(
        'Pensá qué actividades te ayudan a sentirte mejor después de estar un rato largo mirando la pantalla.'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes(
        'Si alguien te manda un mensaje con una oferta que promete plata o premios rápidos, ¿qué es mejor hacer?'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes('Pensá en cómo cuidarte antes de hacer clic.'),
      true
    );
    assert.equal(quizModalSource.includes('Pasar mis datos'), true);
    assert.equal(
      quizModalSource.includes('No entrar ni compartir datos y avisar en casa'),
      true
    );
    assert.equal(quizModalSource.includes('Reenviarlo a todos mis contactos'), true);
    assert.equal(quizModalSource.includes('Aceptar todo sin leer'), true);

    // Modales de feedback para Menor (alto y bajo puntaje, sin emojis y CTA Continuar)
    assert.equal(quizModalSource.includes('¡Felicitaciones!'), true);
    assert.equal(
      quizModalSource.includes('Completaste el juego de preguntas. ¡Muy bien!'),
      true
    );
    assert.equal(
      quizModalSource.includes('Completaste el juego de preguntas. ¡Genial!'),
      true
    );
    assert.equal(
      quizModalSource.includes(
        'Aprovechá para descansar de las pantallas o hacer algo distinto. ¡Y si querés, contá en casa cómo te fue!'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes(
        'Tuviste ${correctCount} de ${preparedQuestions.length} respuestas correctas.'
      ),
      true
    );
    assert.equal(
      quizModalSource.includes(
        'Podés charlar en casa o contarle a una persona adulta cómo te fue haciendo el juego de preguntas. ¡Y si querés, también podés salir un rato al aire libre!'
      ),
      true
    );
    assert.equal(quizModalSource.includes('¡Bien!'), true);
    assert.equal(quizModalSource.includes('Completaste el juego de preguntas.'), true);
    assert.equal(
      quizModalSource.includes(
        'Podés charlar en casa o contarle a una persona adulta cómo te fue y volver a intentarlo cuando quieras. ¡También podés salir un rato al aire libre!'
      ),
      true
    );
    assert.equal(quizModalSource.includes('>Continuar<'), true);
    assert.equal(quizModalSource.includes('➔'), false);
    assert.equal(quizModalSource.includes('¡QUIZ COMPLETADO!'), false);
    assert.equal(quizModalSource.includes('¡FELICITACIONES!!'), false);
  });

  test('Sopa de letras y Juego de la memoria usan los títulos, voseo argentino y modales de feedback actualizados', () => {
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

    // Tableros de Sopa de letras actualizados
    assert.deepEqual(
      WORD_SEARCH_BOARDS.map((b) => b.title),
      ['Los planetas', 'Hábitos de salud', 'Valores humanos']
    );

    // Sopa de letras sin check en pestañas y con textos en voseo argentino
    assert.equal(wordSearchSource.includes('>Sopa de letras<'), true);
    assert.equal(wordSearchSource.includes('`✓ ${b.title}`'), false);
    assert.equal(
      wordSearchSource.includes('Deslizá sobre las letras para formar cada palabra.'),
      true
    );
    assert.equal(wordSearchSource.includes('Encontrá las palabras:'), true);
    assert.equal(
      wordSearchSource.includes(
        'Completaste la sopa de letras sobre {currentTopicPhrase}. ¡Muy bien!'
      ),
      true
    );
    assert.equal(
      wordSearchSource.includes(
        'Encontraste {foundWords.length} de {currentBoard.words.length} palabras escondidas.'
      ),
      true
    );
    assert.equal(
      wordSearchSource.includes(
        '¿Querés hacer otra sopa de letras ahora o preferís volver más tarde?'
      ),
      true
    );
    assert.equal(wordSearchSource.includes('>Más tarde<'), true);
    assert.equal(wordSearchSource.includes('>Ahora<'), true);
    assert.equal(
      wordSearchSource.includes(
        'Podés charlar en casa o contarle a una persona adulta cómo te fue haciendo las diferentes sopas de letras. ¡Y si querés, también podés salir un rato al aire libre!'
      ),
      true
    );
    assert.equal(wordSearchSource.includes('>Continuar<'), true);

    // Juego de la memoria
    assert.equal(
      memoryModalSource.includes(
        'Da vuelta dos tarjetas para encontrar los 6 pares iguales.'
      ),
      true
    );
    assert.equal(
      memoryModalSource.includes('Completaste el juego de la memoria. ¡Muy bien!'),
      true
    );
    assert.equal(memoryModalSource.includes('Encontraste todos los pares.'), true);
    assert.equal(
      memoryModalSource.includes(
        'Si querés, podés compartir en casa cómo te fue o hacer una pausa y salir al aire libre.'
      ),
      true
    );
    assert.equal(memoryModalSource.includes('Continuar'), true);
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

    // Header "Mi cuenta" para ambos modos protegidos con botón volver a Inicio
    assert.equal(screenSource.includes('title="Mi cuenta"'), true);
    assert.equal(menorCuentaSource.includes('Cuenta vinculada con {tutorName}'), true);
    assert.equal(menorCuentaSource.includes('Menor protegido'), true);
    assert.equal(menorCuentaSource.includes('✓ Vinculado'), false);
    assert.equal(adultoCuentaSource.includes('Cuenta vinculada con {tutorName}'), true);
    assert.equal(adultoCuentaSource.includes('Adulto protegido'), true);
    assert.equal(adultoCuentaSource.includes('✓ Vinculado'), false);

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


