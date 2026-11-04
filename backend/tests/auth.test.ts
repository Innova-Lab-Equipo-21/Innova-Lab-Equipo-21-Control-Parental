// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Módulo de Autenticación)
// Archivo: tests/auth.test.ts
// Descripción: Suite de tests de integración para el módulo de autenticación:
//              registro de responsables, inicio de sesión con JWT, rechazo de
//              datos inválidos, duplicados y recuperación de contraseña.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Módulo de Autenticación (Auth API)', () => {
  let server: Server;
  let baseUrl: string;

  before((_, done) => {
    const app = createApp();
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://127.0.0.1:${address.port}`;
        done();
      }
    });
  });

  after((_, done) => {
    server.close(done);
  });

  const testEmail = `tutor_test_${Date.now()}@baprotege.gob.ar`;
  const testPassword = 'PasswordSegura2026!';

  test('POST /api/auth/register debe rechazar datos inválidos con código 422', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'correo-no-valido',
        password: '123', // Menor a 6 caracteres
      }),
    });

    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.errors);
    assert.ok(Array.isArray(data.errors));
  });

  test('POST /api/auth/register debe rechazar a menores de 18 años con código 422', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `menor_${Date.now()}@test.com`,
        password: 'Password123!',
        fullName: 'Menor de Edad',
        birthDate: '15/05/2015', // 11 años aproximadamente
      }),
    });

    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(
      data.errors.some((err: any) =>
        err.message.includes('Solo personas adultas (+18)')
      )
    );
  });

  test('POST /api/auth/register debe registrar un responsable y retornar token JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Mariana Gomez',
        gender: 'Femenino',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.token, 'Debe devolver un token JWT');
    assert.equal(data.data.user.email, testEmail.toLowerCase());
  });

  test('POST /api/auth/register debe rechazar correo duplicado con código 409', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Mariana Duplicada',
      }),
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /ya se encuentra registrado/i);
  });

  test('POST /api/auth/login debe autenticar con credenciales correctas', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.user.email, testEmail.toLowerCase());
  });

  test('POST /api/auth/login debe rechazar contraseña incorrecta con código 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'PasswordEquivocada123',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /inválidas/i);
  });

  test('POST /api/auth/recover-password debe procesar solicitud de recuperación', async () => {
    const res = await fetch(`${baseUrl}/api/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.message);
  });

  test('POST /api/auth/google debe autenticar o registrar usuario con Google', async () => {
    const googleEmail = `google.${Date.now()}@example.com`;
    const res = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleEmail,
        fullName: 'Usuario Google Test',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.user.email, googleEmail);
    assert.equal(data.data.user.fullName, 'Usuario Google Test');
  });
});
