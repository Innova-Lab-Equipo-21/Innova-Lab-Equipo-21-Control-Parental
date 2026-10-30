// ==============================================================================
// Proyecto: BA Protege+
// Utilidad: Validación de Mayoría de Edad (+18) para Registro de Responsable
// Archivo: src/utils/age.ts
// ==============================================================================

/**
 * Calcula la edad exacta en años a partir de una fecha en formato DD/MM/AAAA.
 * Retorna null si el formato o la fecha es inválida.
 */
export const calculateAge = (
  birthDateStr: string,
  referenceDate: Date = new Date()
): number | null => {
  if (!birthDateStr || birthDateStr.trim().length !== 10) {
    return null;
  }

  const parts = birthDateStr.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  if (year < 1900 || year > referenceDate.getFullYear()) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  if (day < 1 || day > 31) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);
  // Verificar consistencia de calendario (ej. evitar 31 de febrero)
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  let age = referenceDate.getFullYear() - year;
  const monthDiff = referenceDate.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < day)) {
    age--;
  }

  return age >= 0 ? age : null;
};

/**
 * Verifica si la fecha de nacimiento corresponde a una persona mayor de edad (18 años o más).
 */
export const isAdult = (
  birthDateStr: string,
  referenceDate: Date = new Date()
): boolean => {
  const age = calculateAge(birthDateStr, referenceDate);
  return age !== null && age >= 18;
};

export const MIN_RESPONSIBLE_AGE = 18;

export const ADULT_VALIDATION_ERROR_MSG =
  'Solo personas adultas (+18) pueden registrarse en el Modo Responsable.';
