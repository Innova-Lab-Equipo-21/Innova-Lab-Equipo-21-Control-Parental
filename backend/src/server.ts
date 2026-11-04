// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/server.ts
// Descripción: Punto de entrada principal para el inicio y escucha del servidor HTTP.
// ==============================================================================

import { createApp } from './app.js';
import { env } from './config/environment.js';
import { connectDatabase } from './config/database.js';

async function bootstrap(): Promise<void> {
  // Intentar conectar con la base de datos relacional PostgreSQL
  await connectDatabase();

  const app = createApp();
  const port = env.PORT;

  app.listen(port, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`🚀 Servidor BA Protege+ ejecutándose en el puerto ${port}`);
    console.log(`🌐 Entorno: ${env.NODE_ENV}`);
    console.log(`🔗 Endpoint de salud: http://localhost:${port}/api/health`);
    console.log('====================================================');
  });
}

bootstrap().catch((error) => {
  console.error('❌ Error fatal durante el arranque del servidor:', error);
  process.exit(1);
});
