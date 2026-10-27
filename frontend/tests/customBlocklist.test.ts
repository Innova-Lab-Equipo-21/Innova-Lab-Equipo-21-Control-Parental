import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/api.service.js';

describe('CRUD de Sitios Bloqueados Personalizados (Modo Responsable)', () => {
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
});
