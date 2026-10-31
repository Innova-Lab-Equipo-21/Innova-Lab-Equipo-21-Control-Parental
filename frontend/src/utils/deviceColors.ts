// ==============================================================================
// Proyecto: BA Protege+
// Componente: Utils (Colores de Destaque y Normalización de Dispositivos)
// Archivo: src/utils/deviceColors.ts
// ==============================================================================

export interface DeviceHighlight {
  color: string;
  bgColor: string;
  borderColor: string;
  badgeLabel: string;
  icon: string;
}

/**
 * Retorna los tokens de color de destaque institucional para cada dispositivo,
 * asegurando uniformidad visual según los perfiles definidos en el proyecto:
 * - Responsable: Azul institucional BA (#007AFF)
 * - Mateo: Verde protección / secundario (#28A745)
 * - Sofía: Púrpura / Modo protegido (#7E22CE)
 * - Dispositivos adicionales: Paleta accesible predefinida
 */
export const getDeviceHighlight = (
  deviceId: string,
  childName?: string,
  deviceName?: string,
  colorIndex: number = 0
): DeviceHighlight => {
  if (deviceId === 'self') {
    return {
      color: '#007AFF',
      bgColor: '#E7F1FF',
      borderColor: '#B6D4FE',
      badgeLabel: 'Responsable',
      icon: '👤',
    };
  }

  // Paleta de 5 colores predefinidos para dispositivos protegidos (junto a Responsable forman las 6 colores del proyecto)
  const protectedPalette = [
    { color: '#28A745', bgColor: '#D1E7DD', borderColor: '#A3CFBB', icon: '📱️', defaultName: 'Protegido 1' }, // 1. Verde
    { color: '#7E22CE', bgColor: '#FAF5FF', borderColor: '#E9D5FF', icon: '📱', defaultName: 'Protegido 2' }, // 2. Púrpura
    { color: '#FD7E14', bgColor: '#FFE8D6', borderColor: '#FFC9A5', icon: '📱', defaultName: 'Protegido 3' }, // 3. Naranja
    { color: '#0DCAF0', bgColor: '#CFF4FC', borderColor: '#9EEAF9', icon: '📱', defaultName: 'Protegido 4' }, // 4. Ciano
    { color: '#D63384', bgColor: '#F7D6E6', borderColor: '#F1AECF', icon: '📱', defaultName: 'Protegido 5' }, // 5. Rosa
  ];

  const resolvedIndex = typeof colorIndex === 'number' && colorIndex >= 0 ? colorIndex : 0;
  const selected = protectedPalette[resolvedIndex % protectedPalette.length];
  return {
    color: selected.color,
    bgColor: selected.bgColor,
    borderColor: selected.borderColor,
    badgeLabel: childName || selected.defaultName,
    icon: selected.icon,
  };
};

/** Normaliza la entrada de un sitio web extrayendo únicamente el host/dominio limpio */
export const cleanDomainInput = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '');
};

/** Valida si el texto ingresado tiene un formato de dominio o URL válido */
export const isValidDomainOrUrl = (input: string): boolean => {
  if (!input || !input.trim()) return false;
  const clean = cleanDomainInput(input);
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
};
