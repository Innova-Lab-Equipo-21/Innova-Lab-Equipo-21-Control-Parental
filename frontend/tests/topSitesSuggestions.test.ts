// ==============================================================================
// Proyecto: BA Protege+
// Componente: Tests Automatizados — Sugerencias Rápidas y Autocompletado de Sitios Web
// Archivo: tests/topSitesSuggestions.test.ts
// Descripción: Verifica el catálogo de 15 sitios de Argentina, la validación inteligente
//              de errores de usuario y el autocompletado en tiempo real.
// ==============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateDomainInputDetailed,
  getDomainAutocompleteSuggestions,
} from '../src/utils/domainValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockCatalog = [
  { name: 'Instagram', domain: 'instagram.com', category: 'Redes sociales', icon: '📷' },
  { name: 'TikTok', domain: 'tiktok.com', category: 'Redes sociales', icon: '📱' },
  { name: 'Bet365', domain: 'bet365.com', category: 'Apuestas', icon: '🎲' },
  { name: 'bplay', domain: 'bplay.bet.ar', category: 'Apuestas', icon: '🎰' },
  { name: 'Infobae', domain: 'infobae.com', category: 'Noticias', icon: '📰' },
];

describe('Sugerencias Rápidas — Top 15 Sitios Web de Argentina', () => {
  const addSiteModalContent = fs.readFileSync(
    path.resolve(__dirname, '../src/components/dashboard/sitios/AddSiteModal.tsx'),
    'utf8'
  );
  const adultoAddSiteModalContent = fs.readFileSync(
    path.resolve(
      __dirname,
      '../src/components/dashboard/protected/adulto/AdultoAddSiteModal.tsx'
    ),
    'utf8'
  );

  test('Define top15ArgentinaSites con exactamente 15 sitios en AddSiteModal.tsx', () => {
    assert.ok(
      addSiteModalContent.includes('export const top15ArgentinaSites = ['),
      'AddSiteModal.tsx debe exportar top15ArgentinaSites'
    );
    assert.ok(
      addSiteModalContent.includes('export const popularSiteCatalog = top15ArgentinaSites'),
      'AddSiteModal.tsx debe exportar popularSiteCatalog'
    );

    const matches = addSiteModalContent.match(/domain:\s*'[a-z0-9.-]+'/g);
    assert.ok(matches, 'Debe encontrarse los dominios del catálogo');
    assert.equal(matches.length, 15, 'Debe haber exactamente 15 sitios en el catálogo');
  });

  test('El catálogo incluye sitios emblemáticos de Argentina en múltiples categorías', () => {
    const requiredSites = [
      'Instagram',
      'TikTok',
      'Facebook',
      'X (Twitter)',
      'YouTube',
      'Netflix',
      'Twitch',
      'Spotify',
      'Roblox',
      'Bet365',
      'bplay',
      'Mercado Libre',
      'Infobae',
      'Olē',
      'Promiedos',
    ];

    for (const siteName of requiredSites) {
      assert.ok(
        addSiteModalContent.includes(`name: '${siteName}'`),
        `El catálogo debe incluir el sitio ${siteName}`
      );
    }
  });

  test('Integra el selector de Sugerencias rápidas en AddSiteModal y AdultoAddSiteModal', () => {
    assert.ok(
      addSiteModalContent.includes('Sugerencias rápidas:'),
      'AddSiteModal.tsx debe incluir la etiqueta Sugerencias rápidas:'
    );
    assert.ok(
      addSiteModalContent.includes('autocompleteContainer'),
      'AddSiteModal.tsx debe incluir la sección de autocompletado de chips'
    );

    assert.ok(
      adultoAddSiteModalContent.includes('Sugerencias rápidas:'),
      'AdultoAddSiteModal.tsx debe incluir la etiqueta Sugerencias rápidas:'
    );
    assert.ok(
      adultoAddSiteModalContent.includes('autocompleteContainer'),
      'AdultoAddSiteModal.tsx debe incluir la sección de autocompletado de chips'
    );
  });
});

describe('Validación Detallada de Errores en Dominio (validateDomainInputDetailed)', () => {
  test('Acepta dominios válidos con extensión y protocolos opcionales', () => {
    assert.equal(validateDomainInputDetailed('casino-ilegal.bet').isValid, true);
    assert.equal(validateDomainInputDetailed('https://sitio.com.ar').isValid, true);
    assert.equal(validateDomainInputDetailed('www.instagram.com').isValid, true);
  });

  test('Detecta espacios en blanco e indica el error específico', () => {
    const res = validateDomainInputDetailed('casino ilegal');
    assert.equal(res.isValid, false);
    assert.ok(res.message?.includes('espacios'));
  });

  test('Detecta caracteres especiales inválidos (@, #, $)', () => {
    const res = validateDomainInputDetailed('casino@sitio.com');
    assert.equal(res.isValid, false);
    assert.ok(res.message?.includes('caracteres no válidos'));
  });

  test('Detecta dominios que terminan en punto (incompletos)', () => {
    const res = validateDomainInputDetailed('mi-sitio.');
    assert.equal(res.isValid, false);
    assert.ok(res.message?.includes('incompleto'));
  });

  test('Detecta falta de extensión y ofrece sugerencia de corrección', () => {
    const res = validateDomainInputDetailed('infobae');
    assert.equal(res.isValid, false);
    assert.ok(res.message?.includes('extensión web'));
    assert.equal(res.suggestedCorrection, 'infobae.com');
  });
});

describe('Autocompletado de Dominio en Tiempo Real (getDomainAutocompleteSuggestions)', () => {
  test('Encuentra coincidencias en el catálogo al escribir fragmentos (ej: "bet")', () => {
    const suggestions = getDomainAutocompleteSuggestions('bet', mockCatalog);
    assert.ok(suggestions.length > 0);
    assert.ok(suggestions.some((s) => s.domain === 'bet365.com'));
    assert.ok(suggestions.some((s) => s.domain === 'bplay.bet.ar'));
  });

  test('Ofrece chips con TLDs comunes cuando el usuario escribe una palabra sin extensión', () => {
    const suggestions = getDomainAutocompleteSuggestions('mi-casino', mockCatalog);
    assert.ok(suggestions.some((s) => s.domain === 'mi-casino.com'));
    assert.ok(suggestions.some((s) => s.domain === 'mi-casino.com.ar'));
    assert.ok(suggestions.some((s) => s.domain === 'mi-casino.bet.ar'));
  });
});
