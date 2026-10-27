// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Módulo de Listas de Bloqueo)
// Archivo: tests/blocklist.test.ts
// Descripción: Suite de tests de integración para el módulo de blocklist:
//              listado oficial LOTBA, listas personalizadas del tutor y operaciones
//              CRUD de dominios bloqueados con control de acceso autenticado.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Módulo de Listas de Bloqueo (Blocklist API)', () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
          resolve();
        }
      });
    });

    // Registrar un tutor para obtener token de autenticación
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `tutor_blocklist_${Date.now()}@baprotege.gob.ar`,
        password: 'PasswordSegura2026!',
        fullName: 'Carlos Gomez',
      }),
    });
    const data = await res.json();
    authToken = data.data.token;
  });

  after((_, done) => {
    server.close(done);
  });

  test('GET /api/blocklist/official debe retornar la lista oficial de LOTBA', async () => {
    const res = await fetch(`${baseUrl}/api/blocklist/official`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data);
    assert.equal(data.data.type, 'OFFICIAL_LOTBA');
    assert.ok(Array.isArray(data.data.domains));
    assert.ok(data.data.domains.length > 0, 'Debe contener dominios de apuestas bloqueados');
  });

  test('GET /api/blocklist/custom sin autenticación debe retornar 401', async () => {
    const res = await fetch(`${baseUrl}/api/blocklist/custom`);
    assert.equal(res.status, 401);
  });

  test('POST /api/blocklist/custom/domains debe permitir agregar un dominio personalizado al tutor', async () => {
    const newDomain = `apuestas-clandestinas-${Date.now()}.bet`;
    const res = await fetch(`${baseUrl}/api/blocklist/custom/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        domain: newDomain,
        category: 'GAMBLING_CUSTOM',
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.domain, newDomain.toLowerCase());
    assert.ok(data.data.id);

    // Verificar que ahora aparece en su lista personalizada
    const listRes = await fetch(`${baseUrl}/api/blocklist/custom`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.data.domains.some((d: any) => d.domain === newDomain.toLowerCase()));

    // Actualizar el dominio (Update del CRUD)
    const updateRes = await fetch(`${baseUrl}/api/blocklist/custom/domains/${data.data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        category: 'JUEGOS_ACTUALIZADO',
        isActive: false,
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.success, true);
    assert.equal(updateData.data.category, 'JUEGOS_ACTUALIZADO');
    assert.equal(updateData.data.isActive, false);

    // Eliminar el dominio personalizado (Delete del CRUD)
    const delRes = await fetch(`${baseUrl}/api/blocklist/custom/domains/${data.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(delRes.status, 200);

    // Verificar que fue eliminado
    const listAfterRes = await fetch(`${baseUrl}/api/blocklist/custom`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listAfterData = await listAfterRes.json();
    assert.ok(!listAfterData.data.domains.some((d: any) => d.id === data.data.id));
  });

  test('POST /api/blocklist/custom/domains con dominio inválido debe retornar 400', async () => {
    const res = await fetch(`${baseUrl}/api/blocklist/custom/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        domain: 'invalido',
      }),
    });
    assert.equal(res.status, 400);
  });
});
