import { test } from 'node:test';
import assert from 'node:assert/strict';
import readline from 'node:readline';
import { emailService } from '../src/services/email.service.js';

test('EmailService envía un mail de prueba', async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const to = await new Promise<string>((resolve) => {
    rl.question('Ingrese el correo al que llegará el mail de prueba: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  const result = await emailService.sendEmail(
    to,
    'Prueba de envío de correo - BA Protege+',
    'Este es un correo de prueba para verificar que el sistema de envío de mails del backend funciona correctamente.',
  );

  assert.ok(result);
  assert.ok(typeof result.success === 'boolean');
});
