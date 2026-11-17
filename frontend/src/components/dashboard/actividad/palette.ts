// ==============================================================================
// Proyecto: BA Protege+
// Componente: Panel de Analítica (Design Tokens — Alto Contraste Cognitivo)
// Archivo: src/components/dashboard/actividad/palette.ts
// Descripción: Paleta específica del panel de analítica según la Propuesta
//              Superadora MVP: Azul Institucional (#0284C7) para Lista LOTBA y
//              Ámbar (#F59E0B) para Lista Personalizada, separados por corte
//              blanco para garantizar accesibilidad visual.
// ==============================================================================

export const analyticsPalette = {
  // Fuente LOTBA (Azul institucional)
  lotbaBlue: '#0284c7',
  lotbaBlueDark: '#0369a1',
  lotbaBlueBg: '#e0f2fe',
  lotbaBlueBorder: '#bae6fd',

  // Fuente Personalizada (Ámbar cálido)
  customAmber: '#f59e0b',
  customAmberDark: '#b45309',
  customAmberBg: '#fef3c7',
  customAmberBorder: '#fde68a',

  // Estados de riesgo / Anti-bypass
  dangerRed: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  dangerDark: '#b91c1c',
  dangerDeep: '#991b1b',
  dangerTagBg: '#fee2e2',

  // Superficies y estructura
  surfaceBg: '#f1f5f9',
  cardBorder: '#e2e8f0',
  offWhite: '#f8fafc',
  white: '#ffffff',

  // Textos
  textMain: '#0f172a',
  textSubtle: '#475569',
  textMuted: '#64748b',

  // Estados operativos (dots y uptime)
  success: '#10b981',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  successDark: '#047857',
  warning: '#f59e0b',
  offline: '#ef4444',

  // Indicador de pico (Google Maps style)
  peakBg: '#fffbeb',
  peakBorder: '#fde68a',
  peakText: '#92400e',
  peakStrong: '#78350f',

  // Cabecera de marca y barra de estado
  headerGradientTop: '#dbeafe',
  headerGradientBottom: '#eff6ff',
  headerBorder: '#bfdbfe',
  statusBarBg: '#dbeafe',
  statusBarText: '#1e3a8a',
} as const;
