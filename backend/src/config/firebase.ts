// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/firebase.ts
// Descripción: Módulo de inicialización de Firebase Admin SDK con soporte para credenciales
//              locales o variables de entorno (FCM / Notificaciones Push).
// ==============================================================================

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'docs', 'firebase-service-account.json');

if (!admin.apps.length) {
  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('🔥 Firebase Admin SDK inicializado correctamente desde credenciales locales.');
    } catch (error) {
      console.error('❌ Error al cargar credenciales locales de Firebase:', error);
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('🔥 Firebase Admin SDK inicializado correctamente desde variables de entorno.');
  } else {
    console.warn('⚠️ Firebase Admin SDK: No se detectaron credenciales. Notificaciones push desactivadas.');
  }
}

export default admin;
