// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Firebase Admin SDK)
// Archivo: tests/firebase.test.ts
// Descripción: Suite de tests de integración para verificar la conexión
//              y funcionalidad del Firebase Admin SDK: inicialización,
//              listado de usuarios y generación de custom tokens.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { auth } from '../src/config/firebase.js';

describe('Firebase Admin SDK Integration', () => {
  before(() => {
    // Firebase se inicializa al importar el módulo (singleton)
    // Verificamos que la inicialización fue exitosa
    assert.ok(auth, 'Firebase Auth debe estar inicializado');
    assert.ok(typeof auth.listUsers === 'function', 'auth.listUsers debe ser una función');
    assert.ok(
      typeof auth.createCustomToken === 'function',
      'auth.createCustomToken debe ser una función',
    );
  });

  after(() => {
    // No hay cleanup necesario para Firebase Admin SDK en tests
  });

  test('Firebase Admin debe estar inicializado correctamente', () => {
    assert.ok(auth.app, 'Debe existir una instancia de Firebase App');
    assert.equal(auth.app.name, '[DEFAULT]', 'Debe ser la app por defecto');
  });

  test('listUsers debe conectar con Firebase Auth y retornar lista', async () => {
    const listUsers = await auth.listUsers(1);
    assert.ok(listUsers, 'Debe retornar resultado de listUsers');
    assert.ok(Array.isArray(listUsers.users), 'users debe ser un array');
    assert.ok(listUsers.users.length >= 0, 'Debe poder listar usuarios (incluso 0)');
  });

  test('createCustomToken debe generar token válido para UID', async () => {
    const testUid = 'test-uid-' + Date.now();
    const customToken = await auth.createCustomToken(testUid);
    assert.ok(customToken, 'Debe generar custom token');
    assert.ok(typeof customToken === 'string', 'Token debe ser string');
    assert.ok(customToken.length > 0, 'Token no debe estar vacío');
    assert.ok(customToken.startsWith('eyJ'), 'Token debe ser JWT (empezar con eyJ)');
  });

  test('createCustomToken debe generar tokens únicos para UIDs diferentes', async () => {
    const uid1 = 'test-uid-unique-1-' + Date.now();
    const uid2 = 'test-uid-unique-2-' + Date.now();

    const token1 = await auth.createCustomToken(uid1);
    const token2 = await auth.createCustomToken(uid2);

    assert.notEqual(token1, token2, 'Tokens para UIDs diferentes deben ser distintos');
  });
});
