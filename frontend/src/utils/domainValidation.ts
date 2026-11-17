// ==============================================================================
// Proyecto: BA Protege+
// Componente: Domain Validation & Autocomplete Utils
// Archivo: src/utils/domainValidation.ts
// Descripción: Utilidades avanzadas de autocompletado en tiempo real y detección
//              detallada de errores de usuario al ingresar dominios web.
// ==============================================================================

import { isValidDomainOrUrl, cleanDomainInput } from './deviceColors';

export interface DomainValidationError {
  isValid: boolean;
  message?: string;
  suggestedCorrection?: string;
}

export interface DomainAutocompleteItem {
  label: string;
  domain: string;
  icon?: string;
  category?: string;
  isTldSuggestion?: boolean;
}

/**
 * Retorna una validación detallada del dominio indicando el error específico si existe
 */
export const validateDomainInputDetailed = (input: string): DomainValidationError => {
  if (!input || !input.trim()) {
    return { isValid: false };
  }

  const raw = input.trim();
  const clean = cleanDomainInput(raw);

  if (raw.includes(' ')) {
    return {
      isValid: false,
      message: '⚠️ Los dominios no pueden contener espacios (ej. casino-ilegal.bet en vez de casino ilegal)',
    };
  }

  if (/[@#$%\^&\*\(\)=\+\[\]\{\};:'",<>\?\\]/.test(clean)) {
    return {
      isValid: false,
      message: '⚠️ El dominio contiene caracteres no válidos (solo se permiten letras, números, guiones y puntos)',
    };
  }

  if (clean.startsWith('.') || clean.startsWith('-')) {
    return {
      isValid: false,
      message: '⚠️ El dominio no puede comenzar con un punto o guión',
    };
  }

  if (clean.endsWith('.')) {
    return {
      isValid: false,
      message: '⚠️ El dominio está incompleto. Escribí la extensión después del punto (ej. .com, .com.ar)',
    };
  }

  if (!clean.includes('.')) {
    const suggested = `${clean}.com`;
    return {
      isValid: false,
      message: '⚠️ Le falta la extensión web. Agregá .com, .com.ar, .bet.ar u otra extensión',
      suggestedCorrection: suggested,
    };
  }

  const parts = clean.split('.');
  const tld = parts[parts.length - 1];

  if (parts[0].length === 0) {
    return {
      isValid: false,
      message: '⚠️ Ingresá el nombre del sitio web antes del punto',
    };
  }

  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      message: '⚠️ La extensión del dominio debe contener al menos 2 letras (ej. .com, .ar, .bet)',
    };
  }

  if (!isValidDomainOrUrl(raw)) {
    return {
      isValid: false,
      message: '⚠️ Ingresá una dirección o dominio válido con extensión (ej. casino.bet, sitio.com.ar)',
    };
  }

  return { isValid: true };
};

/**
 * Genera sugerencias de autocompletado en tiempo real basadas en la entrada parcial del usuario
 */
export const getDomainAutocompleteSuggestions = (
  input: string,
  catalog: Array<{ name: string; domain: string; category: string; icon?: string }>
): DomainAutocompleteItem[] => {
  if (!input || !input.trim()) return [];

  const clean = cleanDomainInput(input).toLowerCase();
  const rawLower = input.toLowerCase().trim();

  const results: DomainAutocompleteItem[] = [];

  // 1. Coincidencias en el catálogo popular
  const catalogMatches = catalog.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(clean) || item.name.toLowerCase().includes(rawLower);
    const domainMatch = item.domain.toLowerCase().includes(clean);
    const catMatch = item.category.toLowerCase().includes(clean);
    return nameMatch || domainMatch || catMatch;
  });

  for (const item of catalogMatches) {
    results.push({
      label: `${item.name} (${item.domain})`,
      domain: item.domain,
      icon: item.icon,
      category: item.category,
    });
  }

  // 2. Si el usuario escribió un texto sin extensión (ej: "mi-sitio"), generar chips de TLDs comunes
  if (!clean.includes('.') && clean.length >= 2) {
    const tlds = ['.com', '.com.ar', '.bet.ar', '.org', '.net'];
    for (const tld of tlds) {
      const suggestedDomain = `${clean}${tld}`;
      if (!results.some((r) => r.domain === suggestedDomain)) {
        results.push({
          label: suggestedDomain,
          domain: suggestedDomain,
          icon: '✨',
          isTldSuggestion: true,
        });
      }
    }
  }

  return results.slice(0, 6);
};
