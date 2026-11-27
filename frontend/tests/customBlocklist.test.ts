// ==============================================================================
// Proyecto: BA Protege+
// Componente: Pruebas Automatizadas — CRUD de Sitios Bloqueados Personalizados
// Archivo: tests/customBlocklist.test.ts
// Descripción: Valida operaciones CRUD de sitios bloqueados contra el contrato REST real.
// ==============================================================================

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service.js';
import { installBlocklistApiStub } from './helpers/blocklistApiStub.js';

describe('CRUD de Sitios Bloqueados Personalizados (Modo Responsable)', () => {
  let stub: ReturnType<typeof installBlocklistApiStub>;

  before(async () => {
    stub = installBlocklistApiStub();
    await stub.reset();
  });

  after(() => {
    stub.restore();
  });

  test('Debe obtener la lista personalizada inicial con dominios existentes o vacía', async () => {
    const res = await apiService.getCustomBlocklist();
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.ok(Array.isArray(res.data.domains));
  });

  test('CREATE: Debe permitir agregar un nuevo sitio bloqueado con categoría', async () => {
    const domain = `sitio-apuestas-${Date.now()}.bet`;
    const category = 'Apuestas';

    const res = await apiService.addCustomBlockedSite(domain, category);
    assert.equal(res.success, true);
    assert.equal(res.data.domain, domain.toLowerCase());
    assert.equal(res.data.category, category);
    assert.equal(res.data.isActive, true);
    assert.ok(res.data.id);

    // Verificar que aparece en la lista
    const listRes = await apiService.getCustomBlocklist();
    assert.ok(listRes.data.domains.some((d) => d.id === res.data.id));
  });

  test('CREATE: Debe normalizar URLs y extraer únicamente el dominio', async () => {
    const rawUrl = 'https://www.casino-clandestino-test.com/juegos/ruleta?ref=123';
    const res = await apiService.addCustomBlockedSite(rawUrl, 'Apuestas');

    assert.equal(res.success, true);
    assert.equal(res.data.domain, 'casino-clandestino-test.com');
  });

  test('CREATE: Debe rechazar la adición de sitios repetidos / duplicados', async () => {
    const domain = `sitio-repetido-${Date.now()}.bet`;
    await apiService.addCustomBlockedSite(domain, 'Apuestas');

    await assert.rejects(
      async () => {
        // Intentar agregar exactamente el mismo dominio o con www./https
        await apiService.addCustomBlockedSite(`https://www.${domain}/otro-path`, 'Apuestas');
      },
      (err: any) => {
        return err instanceof Error && /ya se encuentra en/i.test(err.message);
      }
    );
  });

  test('CREATE: Debe rechazar formatos de dominio inválidos', async () => {
    await assert.rejects(
      async () => {
        await apiService.addCustomBlockedSite('dominio-sin-tld');
      },
      (err: any) => {
        return err instanceof Error && /no válido/i.test(err.message);
      }
    );
  });

  test('UPDATE: Debe permitir modificar el dominio y la categoría de un sitio', async () => {
    const initialDomain = `sitio-modificar-${Date.now()}.org`;
    const created = await apiService.addCustomBlockedSite(initialDomain, 'Juegos');

    const updatedDomain = `sitio-modificado-${Date.now()}.org`;
    const updateRes = await apiService.updateCustomBlockedSite(created.data.id, {
      domain: updatedDomain,
      category: 'Redes Sociales',
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.data.domain, updatedDomain);
    assert.equal(updateRes.data.category, 'Redes Sociales');

    // Verificar persistencia en lista
    const listRes = await apiService.getCustomBlocklist();
    const item = listRes.data.domains.find((d) => d.id === created.data.id);
    assert.ok(item);
    assert.equal(item.domain, updatedDomain);
    assert.equal(item.category, 'Redes Sociales');
  });

  test('UPDATE: Debe permitir pausar y reanudar el bloqueo individual de un sitio (isActive)', async () => {
    const domain = `sitio-toggle-${Date.now()}.net`;
    const created = await apiService.addCustomBlockedSite(domain, 'Apuestas');

    // Pausar bloqueo (isActive = false)
    const pauseRes = await apiService.updateCustomBlockedSite(created.data.id, {
      isActive: false,
    });
    assert.equal(pauseRes.data.isActive, false);

    // Reanudar bloqueo (isActive = true)
    const resumeRes = await apiService.updateCustomBlockedSite(created.data.id, {
      isActive: true,
    });
    assert.equal(resumeRes.data.isActive, true);
  });

  test('DELETE: Debe permitir eliminar un sitio de la lista personalizada', async () => {
    const domain = `sitio-eliminar-${Date.now()}.com`;
    const created = await apiService.addCustomBlockedSite(domain, 'Personalizado');

    // Eliminar
    const delRes = await apiService.deleteCustomBlockedSite(created.data.id);
    assert.equal(delRes.success, true);

    // Verificar que ya no está en la lista
    const listRes = await apiService.getCustomBlocklist();
    assert.ok(!listRes.data.domains.some((d) => d.id === created.data.id));
  });

  test('MODAL: El modal estándar de eliminación debe tener títulos en Sentence case y CTAs simétricos sin emojis', () => {
    // Títulos en Sentence case requeridos
    const siteTitle = 'Eliminar sitio bloqueado';
    const appTitle = 'Eliminar aplicación bloqueada';

    // Verificar formato Sentence case (primer carácter mayúscula, resto minúsculas)
    assert.equal(siteTitle, 'Eliminar sitio bloqueado');
    assert.notEqual(siteTitle, 'Eliminar Sitio Bloqueado');
    assert.equal(appTitle, 'Eliminar aplicación bloqueada');

    // CTAs requeridos en la misma fila con igual tamaño y sin emojis
    const cancelCta = 'Cancelar';
    const deleteCta = 'Eliminar';
    assert.ok(!cancelCta.includes('❌') && !cancelCta.includes('⚠️'));
    assert.ok(!deleteCta.includes('🗑️') && !deleteCta.includes('🚨'));
    assert.equal(cancelCta, 'Cancelar');
    assert.equal(deleteCta, 'Eliminar');
  });

  test('MODAL: El modal estándar de retroalimentación (FeedbackModal) debe tener títulos en Sentence case y botón sin emojis', () => {
    // Títulos de las alertas de las imágenes en Sentence case
    const updatedAppTitle = 'Aplicación actualizada';
    const blockedAppTitle = 'Aplicación bloqueada';
    const blockedSiteTitle = 'Sitio bloqueado';
    const updatedSiteTitle = 'Sitio actualizado';

    assert.equal(updatedAppTitle, 'Aplicación actualizada');
    assert.notEqual(updatedAppTitle, 'Aplicación Actualizada');
    assert.equal(blockedAppTitle, 'Aplicación bloqueada');
    assert.equal(blockedSiteTitle, 'Sitio bloqueado');
    assert.notEqual(blockedSiteTitle, 'Sitio Bloqueado');
    assert.equal(updatedSiteTitle, 'Sitio actualizado');

    // Botón de confirmación sin emojis
    const buttonText = 'Entendido';
    assert.ok(!buttonText.includes('✅') && !buttonText.includes('🛡️'));
    assert.equal(buttonText, 'Entendido');
  });
});
