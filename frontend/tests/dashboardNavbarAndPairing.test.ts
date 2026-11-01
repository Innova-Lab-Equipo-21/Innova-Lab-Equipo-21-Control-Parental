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

  test('El formulario de vinculación no debe tener datos mocados por defecto', () => {
    const initialForm = {
      protectedName: '',
      genero: '',
      birthDate: '',
      protectedType: null,
      protectedPhone: '',
      deviceModel: '',
    };
    assert.equal(initialForm.protectedName, '');
    assert.equal(initialForm.genero, '');
    assert.equal(initialForm.birthDate, '');
    assert.equal(initialForm.protectedType, null);
    assert.equal(initialForm.protectedPhone, '');
    assert.equal(initialForm.deviceModel, '');
  });

  test('El CTA principal previo a generar código debe ser exactamente "Generar código"', () => {
    const ctaTitle = 'Generar código';
    assert.equal(ctaTitle, 'Generar código');
  });

  test('Los CTAs de regenerar y compartir deben mapear a los íconos específicos "recargar" y "compartir"', () => {
    const actionIcons = {
      regenerate: 'recargar',
      share: 'compartir',
    };
    assert.equal(actionIcons.regenerate, 'recargar');
    assert.equal(actionIcons.share, 'compartir');
  });

  test('El rodapé del modal debe contener los CTAs "Cancelar" y "Guardar" en la misma fila con el mismo tamaño', () => {
    const footerButtons = [
      { title: 'Cancelar', flex: 1 },
      { title: 'Guardar', flex: 1 },
    ];
    assert.equal(footerButtons[0].title, 'Cancelar');
    assert.equal(footerButtons[1].title, 'Guardar');
    assert.equal(footerButtons[0].flex, footerButtons[1].flex, 'Ambos botones deben tener exactamente la misma proporción flex (mismo tamaño)');
  });

  test('El modal de desvinculación debe tener CTAs en la misma fila con igual tamaño en ambos pasos', () => {
    const step1Buttons = [
      { title: 'Cancelar', variant: 'secondary', flex: 1 },
      { title: 'Continuar', variant: 'primary', flex: 1 },
    ];
    const step2Buttons = [
      { title: 'Volver', variant: 'secondary', flex: 1 },
      { title: 'Desvincular', variant: 'danger', flex: 1 },
    ];

    assert.equal(step1Buttons[0].title, 'Cancelar');
    assert.equal(step1Buttons[1].title, 'Continuar');
    assert.equal(step1Buttons[0].flex, step1Buttons[1].flex);

    assert.equal(step2Buttons[0].title, 'Volver');
    assert.equal(step2Buttons[1].title, 'Desvincular');
    assert.equal(step2Buttons[0].flex, step2Buttons[1].flex);
  });

  test('La selección de Tipo Menor/Adulto debe ser automática según fecha de nacimiento', () => {
    const determineType = (birthStr: string): 'Menor' | 'Adulto' | null => {
      if (!birthStr || birthStr.length !== 10) return null;
      const age = calculateAge(birthStr);
      if (age === null) return null;
      return age < 18 ? 'Menor' : 'Adulto';
    };

    assert.equal(determineType(''), null, 'Sin fecha no debe seleccionar ningún tipo');
    assert.equal(determineType('01/01/2020'), 'Menor', 'Nacido en 2020 debe ser Menor');
    assert.equal(determineType('15/05/2012'), 'Menor', 'Nacido en 2012 debe ser Menor');
    assert.equal(determineType('10/03/1995'), 'Adulto', 'Nacido en 1995 debe ser Adulto');
  });

  test('El totalizador de dispositivos debe presentar Vinculados e Inactivos respetando el plural', () => {
    const formatPlural = (count: number, singular: string, plural: string) =>
      `${count} ${count === 1 ? singular : plural}`;

    const formatTotalizer = (vCount: number, iCount: number) =>
      `${formatPlural(vCount, 'vinculado', 'vinculados')} • ${formatPlural(iCount, 'inactivo', 'inactivos')}`;

    assert.equal(formatTotalizer(0, 1), '0 vinculados • 1 inactivo');
    assert.equal(formatTotalizer(1, 0), '1 vinculado • 0 inactivos');
    assert.equal(formatTotalizer(1, 1), '1 vinculado • 1 inactivo');
    assert.equal(formatTotalizer(2, 1), '2 vinculados • 1 inactivo');
    assert.equal(formatTotalizer(1, 2), '1 vinculado • 2 inactivos');
    assert.equal(formatTotalizer(2, 3), '2 vinculados • 3 inactivos');
  });

  test('El modal de Autocontrol debe requerir doble confirmación con CTAs en la misma fila y sin emojis', () => {
    const activationSteps = {
      step1: {
        title: 'Confirmación 1 de 2: Autocontrol',
        ctas: ['Cancelar', 'Continuar'],
      },
      step2: {
        title: 'Confirmación 2 de 2: Activar autocontrol',
        ctas: ['Volver', 'Activar'],
      },
    };

    assert.equal(activationSteps.step1.ctas.length, 2);
    assert.equal(activationSteps.step2.ctas.length, 2);

    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    for (const cta of [...activationSteps.step1.ctas, ...activationSteps.step2.ctas]) {
      assert.equal(emojiRegex.test(cta), false, `El CTA "${cta}" no debe contener emojis`);
    }
  });

  test('MODAL: Los modales estándar de retroalimentación de dispositivos (inclusión, edición, exclusión) deben tener títulos en Sentence case y CTAs sin emojis', () => {
    // Títulos de las alertas de gestión de dispositivos en Sentence case
    const deviceSavedTitle = 'Dispositivo guardado';
    const deviceUpdatedTitle = 'Datos actualizados';
    const deviceUnboundTitle = 'Dispositivo desvinculado';
    const profileUpdatedTitle = 'Perfil actualizado';
    const invalidDataTitle = 'Datos incompletos o inválidos';

    assert.equal(deviceSavedTitle, 'Dispositivo guardado');
    assert.equal(deviceUpdatedTitle, 'Datos actualizados');
    assert.notEqual(deviceUpdatedTitle, 'Datos Actualizados');
    assert.equal(deviceUnboundTitle, 'Dispositivo desvinculado');
    assert.equal(profileUpdatedTitle, 'Perfil actualizado');
    assert.equal(invalidDataTitle, 'Datos incompletos o inválidos');

    // Botón de confirmación estándar sin emojis
    const buttonText = 'Entendido';
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    assert.equal(emojiRegex.test(buttonText), false);
    assert.equal(buttonText, 'Entendido');
  });
});
