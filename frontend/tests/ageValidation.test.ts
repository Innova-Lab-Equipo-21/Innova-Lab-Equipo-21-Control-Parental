import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateAge,
  isAdult,
  MIN_RESPONSIBLE_AGE,
  ADULT_VALIDATION_ERROR_MSG,
} from '../src/utils/age';

describe('Validación de Mayoría de Edad para Modo Responsable', () => {
  const refDate = new Date(2026, 9, 4); // 4 de Octubre de 2026

  it('La edad mínima requerida debe ser 18 años', () => {
    assert.strictEqual(MIN_RESPONSIBLE_AGE, 18);
  });

  it('El mensaje de error de validación debe ser claro y específico', () => {
    assert.strictEqual(
      ADULT_VALIDATION_ERROR_MSG,
      'Solo personas adultas (+18) pueden registrarse en el Modo Responsable.'
    );
  });

  it('Debe rechazar a un menor de 18 años (ej. 17 años recién cumplidos)', () => {
    // Nació el 05/10/2008 -> Al 04/10/2026 tiene 17 años
    const age = calculateAge('05/10/2008', refDate);
    assert.strictEqual(age, 17);
    assert.strictEqual(isAdult('05/10/2008', refDate), false);
  });

  it('Debe rechazar a un niño de 10 años', () => {
    const age = calculateAge('15/06/2016', refDate);
    assert.strictEqual(age, 10);
    assert.strictEqual(isAdult('15/06/2016', refDate), false);
  });

  it('Debe aceptar a alguien que cumple 18 años exactamente hoy', () => {
    // Nació el 04/10/2008 -> Al 04/10/2026 tiene 18 años exactos
    const age = calculateAge('04/10/2008', refDate);
    assert.strictEqual(age, 18);
    assert.strictEqual(isAdult('04/10/2008', refDate), true);
  });

  it('Debe aceptar a adultos de más de 18 años', () => {
    const age = calculateAge('12/03/1990', refDate);
    assert.strictEqual(age, 36);
    assert.strictEqual(isAdult('12/03/1990', refDate), true);
  });

  it('Debe retornar null / false para formatos incompletos o inválidos', () => {
    assert.strictEqual(calculateAge('12/05/20'), null);
    assert.strictEqual(calculateAge('31/02/2000'), null); // Día inexistente
    assert.strictEqual(calculateAge('99/99/9999'), null);
    assert.strictEqual(isAdult(''), false);
    assert.strictEqual(isAdult('texto-invalido'), false);
  });
});
