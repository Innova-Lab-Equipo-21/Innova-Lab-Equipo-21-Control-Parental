import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailService } from '../src/services/email.service.js';

test('EmailService envía un mail de prueba', async () => {
  const to = 'tutor@baprotege.gob.ar';

  const result = await emailService.sendEmail(
    to,
    'Prueba de envío de correo - BA Protege+',
    'Este es un correo de prueba para verificar que el sistema de envío de mails del backend funciona correctamente.',
  );

  assert.ok(result);
  assert.ok(typeof result.success === 'boolean');
});
