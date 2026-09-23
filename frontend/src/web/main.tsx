// ==============================================================================
// Proyecto: BA Protege+
// Componente: Entrada del Simulador Web
// Archivo: src/web/main.tsx
// Descripción: Montaje de la aplicación React del simulador en el elemento DOM #root.
// ==============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebSimulator } from './WebSimulator';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSimulator />
  </React.StrictMode>,
);
