// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Configuración de Vite para Pruebas Web)
// Archivo: vite.config.ts
// Descripción: Configuración de Vite para emular y probar la aplicación móvil en el navegador.
// ==============================================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
