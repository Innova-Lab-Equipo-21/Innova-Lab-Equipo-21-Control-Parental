// ==============================================================================
// Proyecto: BA Protege+
// Componente: Backend API
// Archivo: src/config/database.ts
// Descripción: Instanciación singleton del cliente de Prisma para conexión con PostgreSQL.
// ==============================================================================

import { PrismaClient } from '@prisma/client';
import { env } from './environment.js';

// Declaración global para evitar múltiples instancias en entornos de desarrollo con recarga en caliente
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}

/**
 * Función para verificar la conectividad con la base de datos PostgreSQL o activar modo mock.
 */
export async function connectDatabase(): Promise<void> {
  if (env.USE_MOCK_DATA) {
    console.log('⚡ Modo de Datos Simulados (Mock Data) ACTIVO: Operando sin base de datos externa.');
    return;
  }

  try {
    await prisma.$connect();
    console.log('✅ Conexión establecida con éxito con PostgreSQL.');
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a PostgreSQL. Habilitando modo de datos simulados automáticamente.');
  }
}
