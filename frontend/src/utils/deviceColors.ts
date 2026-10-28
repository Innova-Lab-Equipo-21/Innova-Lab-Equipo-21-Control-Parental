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
  index: number = 0
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

  const name = `${childName || ''} ${deviceName || ''}`.toLowerCase();

  if (name.includes('mateo')) {
    return {
      color: '#28A745',
      bgColor: '#D1E7DD',
      borderColor: '#A3CFBB',
      badgeLabel: childName || 'Mateo',
      icon: '🛡️',
    };
  }

  if (name.includes('sofía') || name.includes('sofia')) {
    return {
      color: '#7E22CE',
      bgColor: '#FAF5FF',
      borderColor: '#E9D5FF',
      badgeLabel: childName || 'Sofía',
      icon: '📱',
    };
  }

  // Paleta predefinida para dispositivos adicionales (hasta 5 dispositivos)
  const fallbackPalette = [
    { color: '#FD7E14', bgColor: '#FFE8D6', borderColor: '#FFC9A5', icon: '📱' },
    { color: '#0DCAF0', bgColor: '#CFF4FC', borderColor: '#9EEAF9', icon: '📱' },
    { color: '#D63384', bgColor: '#F7D6E6', borderColor: '#F1AECF', icon: '📱' },
    { color: '#6610F2', bgColor: '#E0CFFC', borderColor: '#C5A3FB', icon: '📱' },
  ];

  const selected = fallbackPalette[index % fallbackPalette.length];
  return {
    color: selected.color,
    bgColor: selected.bgColor,
    borderColor: selected.borderColor,
    badgeLabel: childName || `Protegido ${index + 1}`,
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
