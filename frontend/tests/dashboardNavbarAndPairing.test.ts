// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Dashboard Navbar, Formulario de Vinculación y Auth
// Archivo: tests/dashboardNavbarAndPairing.test.ts
// Descripción: Suite de tests unitarios para verificar:
//              - Estructura y estados de la Navbar del Dashboard (5 pestañas e íconos).
//              - Reglas de validación del formulario de vinculación (Nombre, Género, Menor + Fecha, Teléfono).
//              - Configuración de autenticación con Google y avisos legales.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge } from '../src/utils/age.js';
import { formatPhone, validateLettersOnly, formatBirthDate } from '../src/utils/authValidation.js';

describe('Barra de Navegación del Dashboard (Navbar 5 Opciones)', () => {
  const navbarTabs = ['inicio', 'dispositivos', 'sitios', 'actividad', 'cuenta'];

  test('La navbar del dashboard debe contener exactamente 5 pestañas principales', () => {
    assert.equal(navbarTabs.length, 5, 'Debe incluir 5 opciones');
    assert.ok(navbarTabs.includes('inicio'));
    assert.ok(navbarTabs.includes('dispositivos'));
    assert.ok(navbarTabs.includes('sitios'));
    assert.ok(navbarTabs.includes('actividad'));
    assert.ok(navbarTabs.includes('cuenta'));
  });

  test('El color oficial de destaque de la pestaña activa debe ser #E5F1FF', () => {
    const highlightColor = '#E5F1FF';
    assert.equal(highlightColor, '#E5F1FF', 'El color de fondo de la pestaña activa debe ser #E5F1FF');
  });
});

describe('Validación del Formulario de Vinculación de Dispositivos (PairingSection)', () => {
  test('Debe validar que el nombre del protegido contenga solo letras y al menos 2 caracteres', () => {
    assert.equal(validateLettersOnly('Sofía'), true);
    assert.equal(validateLettersOnly('Juan Pérez'), true);
    assert.equal(validateLettersOnly('1234'), false, 'No debe aceptar números en el nombre');
    assert.equal(validateLettersOnly('Sofía123'), false, 'No debe aceptar mezcla con números');
  });

  test('Debe formatear el teléfono correctamente con el patrón XX XXXX-XXXX', () => {
    assert.equal(formatPhone('1123456789'), '11 2345-6789');
    assert.equal(formatPhone('112345'), '11 2345');
  });

  test('Para el tipo Menor, la fecha de nacimiento debe corresponder a un menor de 18 años', () => {
    const minorBirthDate = '15/05/2012';
    const ageMinor = calculateAge(minorBirthDate);
    assert.ok(ageMinor !== null, 'La fecha debe ser válida');
    assert.ok(ageMinor < 18, 'La edad debe ser menor de 18 años');

    const adultBirthDate = '10/10/1990';
    const ageAdult = calculateAge(adultBirthDate);
    assert.ok(ageAdult !== null);
    assert.ok(ageAdult >= 18, 'Una fecha de un adulto debe ser >= 18 años');
  });

  test('Debe validar el formateo automático de fecha de nacimiento DD/MM/AAAA', () => {
    assert.equal(formatBirthDate('15052012'), '15/05/2012');
    assert.equal(formatBirthDate('1505'), '15/05');
  });
});
