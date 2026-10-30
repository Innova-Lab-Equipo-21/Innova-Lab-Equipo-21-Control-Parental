// ==============================================================================
// Proyecto: BA Protege+
// Componente: Utils (Validación y Seguridad para Formularios de Autenticación)
// Archivo: src/utils/authValidation.ts
// Descripción: Funciones reutilizables para formateo, sanitización y validación de campos.
// ==============================================================================

import { calculateAge } from './age';

export interface RegisterFormData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  registerEmail: string;
  registerPassword: string;
  confirmPassword: string;
}

/** Formatea texto como DD/MM/AAAA */
export const formatBirthDate = (text: string): string => {
  const cleaned = text.replace(/\D/g, '').slice(0, 8);
  let formatted = cleaned;
  if (cleaned.length > 2 && cleaned.length <= 4) {
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else if (cleaned.length > 4) {
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }
  return formatted;
};

/** Formatea teléfono como XX XXXX-XXXX */
export const formatPhone = (text: string): string => {
  const cleaned = text.replace(/\D/g, '').slice(0, 10);
  let formatted = cleaned;
  if (cleaned.length > 2 && cleaned.length <= 6) {
    formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  } else if (cleaned.length > 6) {
    formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  }
  return formatted;
};

/** Valida que el texto solo contenga letras y espacios */
export const validateLettersOnly = (text: string): boolean => {
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return lettersRegex.test(text.trim());
};

/** Valida el formato de correo electrónico */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/** Valida todos los campos del formulario de registro y devuelve mapa de errores */
export const validateRegisterFields = (data: RegisterFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 1. Validación de Nombre (mínimo 2 caracteres)
  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  } else if (!validateLettersOnly(data.nombre)) {
    errors.nombre = 'El nombre solo debe contener letras.';
  }

  // 2. Validación de Apellido (mínimo 2 caracteres)
  if (!data.apellido.trim()) {
    errors.apellido = 'El apellido es obligatorio.';
  } else if (data.apellido.trim().length < 2) {
    errors.apellido = 'El apellido debe tener al menos 2 caracteres.';
  } else if (!validateLettersOnly(data.apellido)) {
    errors.apellido = 'El apellido solo debe contener letras.';
  }

  // 3. Validación de Fecha de Nacimiento (Mayoría de edad obligatoria +18)
  if (!data.fechaNacimiento.trim()) {
    errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria para verificar mayoría de edad (+18).';
  } else if (data.fechaNacimiento.length !== 10) {
    errors.fechaNacimiento = 'Formato inválido. Debe ser DD/MM/AAAA.';
  } else {
    const age = calculateAge(data.fechaNacimiento);
    if (age === null) {
      errors.fechaNacimiento = 'Fecha de nacimiento inválida.';
    } else if (age < 18) {
      errors.fechaNacimiento = 'Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado.';
    }
  }

  // 4. Validación de Teléfono (mínimo 10 dígitos)
  const phoneDigits = data.telefono.replace(/\D/g, '');
  if (data.telefono.trim().length > 0 && phoneDigits.length < 10) {
    errors.telefono = 'El teléfono debe contener al menos 10 dígitos (ej. 11 2345-6789).';
  }

  // 5. Validación de Correo Electrónico
  if (!data.registerEmail.trim()) {
    errors.registerEmail = 'El correo electrónico es obligatorio.';
  } else if (!validateEmailFormat(data.registerEmail)) {
    errors.registerEmail = 'El correo electrónico no tiene un formato válido.';
  }

  // 6. Validación de Contraseña
  if (!data.registerPassword) {
    errors.registerPassword = 'La contraseña es obligatoria.';
  } else if (data.registerPassword.length < 6) {
    errors.registerPassword = 'La contraseña debe tener al menos 6 caracteres.';
  }

  // 7. Validación de Confirmación de Contraseña
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar tu contraseña.';
  } else if (data.registerPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
};
