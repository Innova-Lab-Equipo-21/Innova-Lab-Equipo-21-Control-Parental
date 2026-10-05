// ==============================================================================
// Proyecto: BA Protege+
// Componente: Frontend Mobile (Configuración de Vite para Pruebas Web)
// Archivo: vite.config.ts
// Descripción: Configuración de Vite con shim de React Native para emular la app en navegador.
// ==============================================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, 'src/web/react-native-shim.tsx'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
