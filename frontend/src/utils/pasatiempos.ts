// ==============================================================================
// Proyecto: BA Protege+
// Archivo: src/utils/pasatiempos.ts
// Descripción: Lógica pura y definiciones de datos para la navegación diferenciada
//              entre Modo Protegido Adulto y Menor, rotación dinámica de juegos en
//              Inicio, ordenamiento de juegos activos/inactivos en Pasatiempos y
//              tableros interactivos (Quiz, Sopa de letras y Juego de la memoria
//              de 12 piezas).
// ==============================================================================

export type ProtectedProfileMode = 'CHILD' | 'ADULT';

export type ProtectedTab = 'inicio' | 'sitios' | 'pasatiempos' | 'actividad' | 'cuenta';

export type PasatiempoGameId = 'quiz' | 'wordsearch' | 'memory';

export type CompletedGamesState = Record<PasatiempoGameId, boolean>;

export interface PasatiempoGameMeta {
  id: PasatiempoGameId;
  title: string;
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  cardDescription: string;
  bgColor: string;
  accentTextColor: string;
  lightTextColor: string;
  badgeEmoji: string;
}

export const INITIAL_COMPLETED_GAMES: CompletedGamesState = {
  quiz: false,
  wordsearch: false,
  memory: false,
};

export const PASATIEMPOS_ORDER: PasatiempoGameId[] = ['quiz', 'wordsearch', 'memory'];

export const PASATIEMPOS_CATALOG: Record<PasatiempoGameId, PasatiempoGameMeta> = {
  quiz: {
    id: 'quiz',
    title: 'Juego de preguntas',
    homeBannerTitle: '¿Hacemos un juego de preguntas?',
    homeBannerSubtitle:
      'Poné a prueba tus conocimientos sobre la navegación digital de forma divertida.',
    cardDescription:
      'Respondé preguntas interactivas sobre seguridad en internet, privacidad y hábitos saludables.',
    bgColor: '#16A34A',
    accentTextColor: '#15803D',
    lightTextColor: '#DCFCE7',
    badgeEmoji: '🎯',
  },
  wordsearch: {
    id: 'wordsearch',
    title: 'Sopa de letras',
    homeBannerTitle: '¿Jugamos una sopa de letras?',
    homeBannerSubtitle:
      'Encontrá las palabras escondidas y divertite aprendiendo sobre los planetas, hábitos de salud y valores humanos.',
    cardDescription:
      'Descubrí palabras ocultas sobre los planetas, hábitos de salud y valores humanos.',
    bgColor: '#6D28D9',
    accentTextColor: '#5B21B6',
    lightTextColor: '#EDE9FE',
    badgeEmoji: '🔤',
  },
  memory: {
    id: 'memory',
    title: 'Juego de la memoria',
    homeBannerTitle: '¿Hacemos el juego de la memoria?',
    homeBannerSubtitle:
      'Da vuelta las tarjetas y encontrá los pares iguales. ¡A ver cómo te va!',
    cardDescription:
      'Encontrá los 6 pares ocultos entre las 12 fichas para entrenar tu atención y memoria.',
    bgColor: '#F59E0B',
    accentTextColor: '#B45309',
    lightTextColor: '#FEF3C7',
    badgeEmoji: '🃏',
  },
};

/**
 * Devuelve las pestañas de la barra inferior según el perfil protegido:
 * - CHILD (Menor): Inicio, Pasatiempos, Actividad, Cuenta
 * - ADULT (Adulto): Inicio, Sitios y apps, Actividad, Cuenta
 */
export function getProtectedNavbarTabs(mode: ProtectedProfileMode): ProtectedTab[] {
  if (mode === 'CHILD') {
    return ['inicio', 'pasatiempos', 'actividad', 'cuenta'];
  }
  return ['inicio', 'sitios', 'actividad', 'cuenta'];
}

/**
 * Normaliza la pestaña activa cuando cambia el modo entre Menor y Adulto.
 */
export function normalizeProtectedTabForMode(
  tab: ProtectedTab,
  mode: ProtectedProfileMode
): ProtectedTab {
  const validTabs = getProtectedNavbarTabs(mode);
  return validTabs.includes(tab) ? tab : 'inicio';
}

/**
 * Devuelve la cantidad de pasatiempos completados (0 a 3).
 */
export function getCompletedGamesCount(completed: CompletedGamesState): number {
  return PASATIEMPOS_ORDER.filter((id) => completed[id]).length;
}

/**
 * Indica si el menor ya completó los 3 juegos disponibles.
 */
export function areAllGamesCompleted(completed: CompletedGamesState): boolean {
  return PASATIEMPOS_ORDER.every((id) => completed[id]);
}

/**
 * Indica si un pasatiempo puede jugarse (una vez completado queda inactivo y no
 * puede volver a jugarse).
 */
export function canPlayPasatiempoGame(
  completed: CompletedGamesState,
  gameId: PasatiempoGameId
): boolean {
  return !completed[gameId];
}

/**
 * Ordena los pasatiempos para la pantalla Pasatiempos:
 * - Primero los juegos activos (no completados) en su orden natural.
 * - Al final de la lista los juegos completados (inactivos), respetando el orden
 *   en que se completaron si se proporciona `completedOrder`.
 */
export function getOrderedPasatiemposForDisplay(
  completed: CompletedGamesState,
  completedOrder: PasatiempoGameId[] = []
): PasatiempoGameId[] {
  const pending = PASATIEMPOS_ORDER.filter((id) => !completed[id]);
  const completedFromHistory = completedOrder.filter(
    (id) => completed[id] && PASATIEMPOS_ORDER.includes(id)
  );
  const completedRemaining = PASATIEMPOS_ORDER.filter(
    (id) => completed[id] && !completedFromHistory.includes(id)
  );
  return [...pending, ...completedFromHistory, ...completedRemaining];
}

/**
 * Selecciona dinámicamente el próximo juego disponible que aún no fue completado.
 * Si los 3 ya fueron completados, retorna null para mostrar la sugerencia sin pantallas.
 */
export function getNextAvailableGame(
  completed: CompletedGamesState
): PasatiempoGameMeta | null {
  const nextId = PASATIEMPOS_ORDER.find((id) => !completed[id]);
  return nextId ? PASATIEMPOS_CATALOG[nextId] : null;
}

/**
 * Mensaje de sugerencia cuando el menor completa los 3 juegos en Inicio.
 */
export const SCREEN_FREE_SUGGESTION = {
  title: '¡Completaste los 3 pasatiempos!',
  subtitle:
    'Ya hiciste el juego de preguntas, la sopa de letras y el juego de la memoria. ¡Muy bien!',
  tipTitle: 'Sugerencia sin pantallas',
  tipBody:
    'Es un buen momento para alejarse de las pantallas. Podés salir a pasear o distraerte con otra cosa.',
};

// ==============================================================================
// SOPA DE LETRAS — Tableros y validación
// ==============================================================================

export interface WordPlacement {
  word: string;
  label: string;
  row: number;
  col: number;
  dRow: number;
  dCol: number;
  color: string;
}

export interface WordSearchBoard {
  id: string;
  title: string;
  subtitle: string;
  size: number;
  words: WordPlacement[];
}

const DETERMINISTIC_FILLER = 'LPMNSRTVCAEOIUBDFGHJKQXZ';

export const WORD_SEARCH_BOARDS: WordSearchBoard[] = [
  {
    id: 'planetas',
    title: 'Los planetas',
    subtitle: 'Encontrá los 8 planetas del sistema solar',
    size: 9,
    words: [
      { word: 'MERCURIO', label: 'Mercurio', row: 0, col: 0, dRow: 1, dCol: 0, color: '#DDD6FE' },
      { word: 'NEPTUNO', label: 'Neptuno', row: 0, col: 1, dRow: 0, dCol: 1, color: '#BAE6FD' },
      { word: 'SATURNO', label: 'Saturno', row: 1, col: 8, dRow: 1, dCol: 0, color: '#FDE68A' },
      { word: 'TIERRA', label: 'Tierra', row: 2, col: 1, dRow: 0, dCol: 1, color: '#BBF7D0' },
      { word: 'VENUS', label: 'Venus', row: 2, col: 7, dRow: 1, dCol: 0, color: '#FBCFE8' },
      { word: 'URANO', label: 'Urano', row: 4, col: 1, dRow: 0, dCol: 1, color: '#A5F3FC' },
      { word: 'MARTE', label: 'Marte', row: 6, col: 1, dRow: 0, dCol: 1, color: '#FECACA' },
      { word: 'JUPITER', label: 'Júpiter', row: 8, col: 1, dRow: 0, dCol: 1, color: '#FED7AA' },
    ],
  },
  {
    id: 'salud',
    title: 'Hábitos de salud',
    subtitle: 'Hábitos saludables para tu día a día',
    size: 9,
    words: [
      { word: 'DEPORTE', label: 'Deporte', row: 0, col: 0, dRow: 1, dCol: 0, color: '#BBF7D0' },
      { word: 'AMIGOS', label: 'Amigos', row: 1, col: 1, dRow: 0, dCol: 1, color: '#BAE6FD' },
      { word: 'SALUD', label: 'Salud', row: 1, col: 8, dRow: 1, dCol: 0, color: '#DDD6FE' },
      { word: 'PASEO', label: 'Paseo', row: 3, col: 2, dRow: 0, dCol: 1, color: '#FDE68A' },
      { word: 'CALMA', label: 'Calma', row: 6, col: 2, dRow: 0, dCol: 1, color: '#FBCFE8' },
      { word: 'BIENESTAR', label: 'Bienestar', row: 8, col: 0, dRow: 0, dCol: 1, color: '#A7F3D0' },
    ],
  },
  {
    id: 'valores',
    title: 'Valores humanos',
    subtitle: 'Palabras positivas para compartir',
    size: 9,
    words: [
      { word: 'PACIENCIA', label: 'Paciencia', row: 0, col: 0, dRow: 0, dCol: 1, color: '#DDD6FE' },
      { word: 'ALEGRIA', label: 'Alegría', row: 1, col: 0, dRow: 1, dCol: 0, color: '#FDE68A' },
      { word: 'RESPETO', label: 'Respeto', row: 1, col: 8, dRow: 1, dCol: 0, color: '#BAE6FD' },
      { word: 'BONDAD', label: 'Bondad', row: 3, col: 1, dRow: 0, dCol: 1, color: '#BBF7D0' },
      { word: 'AMOR', label: 'Amor', row: 5, col: 2, dRow: 0, dCol: 1, color: '#FBCFE8' },
      { word: 'PAZ', label: 'Paz', row: 8, col: 3, dRow: 0, dCol: 1, color: '#A5F3FC' },
    ],
  },
];

export interface GridCellCoord {
  row: number;
  col: number;
}

export function getWordCells(placement: WordPlacement): GridCellCoord[] {
  const cells: GridCellCoord[] = [];
  for (let i = 0; i < placement.word.length; i++) {
    cells.push({
      row: placement.row + placement.dRow * i,
      col: placement.col + placement.dCol * i,
    });
  }
  return cells;
}

export function buildWordSearchGrid(board: WordSearchBoard): string[][] {
  const grid: string[][] = Array.from({ length: board.size }, (_, r) =>
    Array.from({ length: board.size }, (__, c) => {
      const idx = (r * 7 + c * 3 + board.id.length) % DETERMINISTIC_FILLER.length;
      return DETERMINISTIC_FILLER[idx];
    })
  );

  for (const placement of board.words) {
    for (let i = 0; i < placement.word.length; i++) {
      const r = placement.row + placement.dRow * i;
      const c = placement.col + placement.dCol * i;
      grid[r][c] = placement.word[i];
    }
  }

  return grid;
}

/**
 * Obtiene las celdas en línea recta (horizontal, vertical o diagonal) entre dos puntos.
 * Retorna null si no forman una línea recta válida.
 */
export function getStraightLineCells(
  start: GridCellCoord,
  end: GridCellCoord
): GridCellCoord[] | null {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;

  if (rowDiff === 0 && colDiff === 0) {
    return [start];
  }

  const isHorizontal = rowDiff === 0;
  const isVertical = colDiff === 0;
  const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff);

  if (!isHorizontal && !isVertical && !isDiagonal) {
    return null;
  }

  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  const stepRow = rowDiff === 0 ? 0 : rowDiff / steps;
  const stepCol = colDiff === 0 ? 0 : colDiff / steps;

  const cells: GridCellCoord[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + stepRow * i,
      col: start.col + stepCol * i,
    });
  }
  return cells;
}

/**
 * Verifica si una secuencia de celdas coincide exactamente con alguna palabra
 * pendiente del tablero (en sentido directo o inverso).
 */
export function findMatchingWordPlacement(
  board: WordSearchBoard,
  selectedCells: GridCellCoord[],
  alreadyFoundWords: string[]
): WordPlacement | null {
  if (selectedCells.length < 2) return null;

  for (const placement of board.words) {
    if (alreadyFoundWords.includes(placement.word)) continue;

    const targetCells = getWordCells(placement);
    if (targetCells.length !== selectedCells.length) continue;

    const matchesForward = targetCells.every(
      (cell, idx) =>
        cell.row === selectedCells[idx].row && cell.col === selectedCells[idx].col
    );
    const matchesBackward = targetCells.every(
      (cell, idx) =>
        cell.row === selectedCells[selectedCells.length - 1 - idx].row &&
        cell.col === selectedCells[selectedCells.length - 1 - idx].col
    );

    if (matchesForward || matchesBackward) {
      return placement;
    }
  }

  return null;
}

// ==============================================================================
// JUEGO DE LA MEMORIA — 12 piezas (6 pares) y lógica de emparejamiento
// ==============================================================================

export interface MemoryPairSpec {
  pairId: string;
  emoji: string;
  label: string;
  bgColor: string;
}

export interface MemoryCardItem extends MemoryPairSpec {
  uid: number;
}

export const MEMORY_PAIRS: MemoryPairSpec[] = [
  { pairId: 'deporte', emoji: '⚽', label: 'Deporte', bgColor: '#DCFCE7' },
  { pairId: 'lectura', emoji: '📚', label: 'Lectura', bgColor: '#DBEAFE' },
  { pairId: 'musica', emoji: '🎸', label: 'Música', bgColor: '#FEF3C7' },
  { pairId: 'amigos', emoji: '🤝', label: 'Amigos', bgColor: '#FCE7F3' },
  { pairId: 'naturaleza', emoji: '🌳', label: 'Paseo', bgColor: '#CCFBF1' },
  { pairId: 'arte', emoji: '🎨', label: 'Arte', bgColor: '#EDE9FE' },
];

export const MEMORY_TOTAL_CARDS = MEMORY_PAIRS.length * 2; // 12 piezas

/**
 * Genera y mezcla el mazo de 12 piezas (6 pares) del Juego de la memoria.
 */
export function createMemoryDeck(): MemoryCardItem[] {
  const duplicated: MemoryCardItem[] = MEMORY_PAIRS.flatMap((pair, idx) => [
    { ...pair, uid: idx * 2 },
    { ...pair, uid: idx * 2 + 1 },
  ]);

  const deck = [...duplicated];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Verifica si dos posiciones distintas del mazo forman un par válido.
 */
export function areMemoryCardsMatching(
  deck: MemoryCardItem[],
  firstIdx: number,
  secondIdx: number
): boolean {
  if (firstIdx === secondIdx) return false;
  const cardA = deck[firstIdx];
  const cardB = deck[secondIdx];
  if (!cardA || !cardB) return false;
  return cardA.pairId === cardB.pairId;
}

/**
 * Determina si los 6 pares (las 12 piezas) ya fueron encontrados.
 */
export function isMemoryGameCompleted(matchedPairIds: string[]): boolean {
  const uniqueMatched = new Set(matchedPairIds);
  return MEMORY_PAIRS.every((pair) => uniqueMatched.has(pair.pairId));
}
