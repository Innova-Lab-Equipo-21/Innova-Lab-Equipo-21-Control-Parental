// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API (Tests Automatizados — Health Check y Disponibilidad)
// Archivo: tests/health.test.ts
// Descripción: Suite de tests de integración para verificar la disponibilidad
//              del servidor: endpoint GET /api/health con estado UP y manejo
//              correcto de rutas no encontradas con respuesta 404 estructurada.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('API Health Check Endpoint', () => {
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
    server.closeAllConnections?.();
    server.close(done);
  });

  test('GET /api/health debe responder 200 con status UP', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'UP');
    assert.equal(data.project, 'BA Protege+');
    assert.ok(data.timestamp);
  });

  test('Ruta inexistente debe retornar 404', async () => {
    const res = await fetch(`${baseUrl}/api/ruta-inexistente-xyz`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, 'Recurso no encontrado en el servidor');
  });
});
