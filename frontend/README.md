# BA Protege+ — Frontend Mobile Android

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile Android (React Native + Kotlin)
Archivo: frontend/README.md
Descripción: Documentación técnica completa, guía de instalación, Kit UI/UX,
             Flujo de Acceso Inteligente (Primer Acceso del Responsable),
             Panel Ejecutivo Modular de Actividad (5 Bloques + 3 Modales),
             Identificación de Origen (Adulto Protegido -> Responsable),
             Dashboards Diferenciados para Protegido Adulto y Menor (Pasatiempos
             con Quiz, Sopa de Letras y Memoria de 12 piezas), Mascotas Boti y
             Botito con Sentimientos Dinámicos y Suite de 116 Pruebas.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de Acceso con detección de Primer Ingreso del Responsable (`responsibleFirstAccess.ts`)**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)** con **Modales Bottom Sheet Legales (`TermsModal` / `PrivacyModal`)** y selector de fecha (`DatePickerModal`), **Ingreso con Google (`logo_google.png`)**, **Gestión y Auditoría de 6 Permisos Android (`PermissionsScreen.tsx`)** con activación unidireccional en modos protegidos, **Navegación de 5 Pestañas en Modo Responsable (`DashboardNavbar.tsx`)**, **Panel Ejecutivo Modular de Actividad (`src/components/dashboard/actividad/`)** con 5 bloques de métricas y histograma de 24h, **Trazabilidad de Origen de Bloqueos entre Adulto Protegido y Responsable**, **Dashboards Diferenciados de 4 Módulos para Protegido Adulto y Protegido Menor** (con pestaña **Pasatiempos**: *Quiz*, *Sopa de letras* y *Juego de la memoria de 12 piezas*), **Sistema de Mascotas Emocionales (`Beti`, `Boti` y `Botito`)**, **Autoprotección del Responsable con bloqueo obligatorio de 24hs**, gestión de **hasta 5 dispositivos vinculados**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService`, **Capa de Servicios API Modularizada (`src/services/api/`)** y **Suite Automatizada de 116 Tests (27 suites)**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de Acceso y "Elegir protección"](#-flujo-ordenado-de-acceso-y-elegir-protección)
3. [Reglas de Negocio Implementadas](#-reglas-de-negocio-implementadas)
4. [Sistema de Diseño, Mascotas Emocionales y Kit UI/UX](#-sistema-de-diseño-mascotas-emocionales-y-kit-uiux)
5. [Home y Panel Ejecutivo Modular de Actividad (Modo Responsable)](#-home-y-panel-ejecutivo-modular-de-actividad-modo-responsable)
6. [Gestión de Sitios y Apps + Trazabilidad de Origen](#-gestión-de-sitios-y-apps--trazabilidad-de-origen)
7. [Dashboards Diferenciados: Modo Protegido Adulto vs. Modo Menor](#-dashboards-diferenciados-modo-protegido-adulto-vs-modo-menor)
8. [Pestaña de Cuenta Unificada por Rol](#-pestaña-de-cuenta-unificada-por-rol)
9. [Actualizaciones Recientes y Avances Técnicos](#-actualizaciones-recientes-y-avances-técnicos)
10. [Estructura del Proyecto](#-estructura-del-proyecto)
11. [Guía de Instalación y Pruebas con APK](#-guía-de-instalación-y-pruebas-con-apk)

---

## 🛠️ Tecnologías y Arquitectura

- **Framework Móvil:** React Native 0.87 (TypeScript estricto)
- **Sistema de Diseño:** Kit UI/UX oficial (`src/theme/` y `src/components/`)
- **Compilación Android:** Gradle + Android Studio (Emulador o Celular Físico)
- **Capa Nativa Android:** Kotlin 2.x / Android SDK Platform 35/37 (Java 17)
- **Motor de Filtrado:** `android.net.VpnService` local con caché offline
- **Anti-Bypass & Resiliencia:** `BootReceiver` (`RECEIVE_BOOT_COMPLETED`) y validación de tiempo confiable (`getReliableTimestamp()`)
- **Servicios en Primer Plano:** `NotificationManager` con canal persistente de seguridad
- **Puente Nativo:** `ProtectionModule` (`ReactContextBaseJavaModule`)
- **Capa de Servicios API:** Modularizada en `src/services/api/` (`auth`, `devices`, `blocklist`, `selfControl`, `telemetry`) con fachada unificada `apiService` y soporte híbrido online/offline (`safeStorage`)
- **Testing Automatizado:** Node Test Runner + `tsx` (`116 tests` distribuidos en `27 suites` y `15` archivos de prueba)

---

## 🔄 Flujo Ordenado de Acceso y "Elegir protección"

La aplicación estructura su navegación desde `src/App.tsx` adaptándose al perfil elegido y recordando si el Responsable ya realizó su configuración inicial:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 1: SPLASH ANIMADO + ONBOARDING WIZARD DE 3 PANTALLAS            │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 2: SELECCIÓN DE MODO OPERATIVO (WelcomeScreen — Sin scroll)     │
│ - Modo Responsable (Escudo) vs. Modo Protegido (Corazón)             │
└──────────────────┬─────────────────────────────────┬─────────────────┘
                   │                                 │
                   ▼                                 ▼
┌───────────────────────────────────┐   ┌──────────────────────────────┐
│ PASO 3A: MODO RESPONSABLE         │   │ PASO 3B: MODO PROTEGIDO      │
│ - Crear Cuenta (+18) / Login      │   │ - Código 123456 (Menor)      │
│ - Google Auth / Términos          │   │ - Código 654321 (Adulto)     │
└──────────────────┬────────────────┘   └──────────────┬───────────────┘
                   │                                   │
                   └─────────────────┬─────────────────┘
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 4: PERMISOS DEL DISPOSITIVO ANDROID (PermissionsScreen)         │
│ - 6 permisos clave auditados en tiempo real                          │
│ - En modos protegidos: solo permite activar, nunca desactivar        │
└──────────────────┬─────────────────────────────────┬─────────────────┘
                   │ (Responsable)                   │ (Protegido)
                   ▼                                 ▼
┌───────────────────────────────────┐   ┌──────────────────────────────┐
│ PASO 4.1: "ELEGIR PROTECCIÓN"     │   │ PASO 5B: DASHBOARD PROTEGIDO │
│ (Solo en el 1er acceso del usuario│   │ - Adulto: Inicio, Sitios y   │
│  Responsable)                     │   │   apps, Actividad, Cuenta    │
│ • Vincular dispositivo -> Modal   │   │ - Menor: Inicio, Pasatiempos,│
│   "Vincular nuevo dispositivo"    │   │   Actividad, Cuenta          │
│   -> Guarda -> Va directo a Home  │   └──────────────────────────────┘
│ • Configurar este dispositivo ->  │
│   Va a "Sitios y apps" (lista     │
│   vacía con aviso) -> Activa      │
│   Autoprotección -> Va a Home     │
└──────────────────┬────────────────┘
                   ▼
┌───────────────────────────────────┐
│ PASO 5A: DASHBOARD RESPONSABLE    │
│ 5 Pestañas: Inicio, Dispositivos, │
│ Sitios y apps, Actividad, Cuenta  │
└───────────────────────────────────┘
```

---

## 📜 Reglas de Negocio Implementadas

1. **Pantalla "Elegir protección" exclusiva del Primer Acceso (`responsibleFirstAccess.ts`):**
   - Se presenta únicamente la primera vez que cada usuario Responsable accede a la app (persistido por correo normalizado o ID). En inicios de sesión posteriores pasa directamente a **Inicio (Home)**.
   - **Vincular dispositivo:** abre el modal `"Vincular nuevo dispositivo"` (`PairingModal.tsx`) y, una vez guardado el dispositivo, redirige directo a **Inicio (Home)**.
   - **Configurar este dispositivo:** dirige a **Sitios y apps**, que inicia con lista vacía (`0` sitios y `0` apps) mostrando un aviso claro de que primero debe agregarse al menos un sitio o app con el botón `+` para habilitar **Autoprotección**. Al activar **Autoprotección**, redirige automáticamente a **Inicio (Home)**.
2. **Límite de Dispositivos Protegidos:**
   - Un Responsable puede vincular hasta **5 dispositivos protegidos** (`MAX_PROTECTED_DEVICES = 5`). Al alcanzar el tope, el botón `+` de adición se oculta automáticamente.
3. **Autoprotección / Autocontrol del Responsable con Compromiso de 24 Horas:**
   - Doble confirmación guiada (`AutocontrolConfirmationModal.tsx`).
   - **Requisito mínimo:** Deshabilitada mientras existan `0` sitios y `0` apps en la lista personalizada; se habilita al registrar al menos un elemento.
   - **Inviolabilidad de bloqueos (24hs):** Durante las primeras **24 horas** (`ACTIVE_LOCKED`) tras activarse, no se permite desactivar la autoprotección ni pausar/eliminar reglas aplicadas al dispositivo del responsable.
   - **Reinicio limpio:** Cumplidas las 24 horas (`DEACTIVATION_READY`), puede desactivarse manualmente; al reactivar, el ciclo de 24 horas comienza nuevamente desde cero.
4. **Permisos Android Unidireccionales en Modos Protegidos (`permissionChecker.ts`):**
   - Supervisión de los **6 permisos clave** (*Servicio VPN*, *Accesibilidad*, *Notificaciones*, *Sin optimización de batería*, *Ubicación* y *Acceso al uso*).
   - Tanto el **Adulto Protegido** como el **Menor** pueden conceder permisos pendientes desde su alerta `DISPOSITIVO NO PROTEGIDO`, pero **nunca desactivarlos**.
5. **Trazabilidad de Bloqueos del Adulto Protegido:**
   - Todo sitio o aplicación bloqueado voluntariamente por un **Adulto Protegido** queda registrado con metadatos de autoría (`ADULTO_PROTEGIDO`), es **permanente para el protegido** (solo el Responsable puede editarlo, pausarlo o eliminarlo) y se identifica visualmente en el panel del Responsable.
6. **Juegos Educativos de Uso Único Diario en Modo Menor (`pasatiempos.ts`):**
   - Cuando el menor completa un juego (*Quiz*, *Sopa de letras* o *Juego de la memoria*), no tiene opción de volver a jugarlo: pasa automáticamente al final de la lista en estado **Completado / Inactivo**, promoviendo el descanso de pantallas al finalizar los 3 desafíos.

---

## 🎨 Sistema de Diseño, Mascotas Emocionales y Kit UI/UX

### 1. Tokens de Color Oficiales (`src/theme/colors.ts`)
- **Primary (`#007AFF`):** Acciones principales, encabezados institucionales, enlaces y serie LOTBA.
- **Header Institucional (`#EAF3FF`) & Active Tab (`#E5F1FF`):** Cabecera superior con `logo_baprotege_texto.png` y destaque de pestaña activa en barras de navegación.
- **Custom Source Indigo (`#6366F1` / `#EEF2FF`):** Identificación visual de bloqueos provenientes de lista personalizada en métricas de Actividad.
- **Secondary / Success (`#28A745`):** Protección activa, permisos concedidos y juegos completados.
- **Warning (`#D97706` / `#FEF3C7`):** Avisos de permisos pendientes (`DISPOSITIVO NO PROTEGIDO`) y requisitos previos de autoprotección.
- **Danger (`#DC3545`):** Bloqueos críticos, alertas para menores y acciones destructivas.

### 2. Mascotas Oficiales por Perfil y Sentimiento (`botMascots.ts` & `botAssets.ts`)
Cada rol cuenta con su propio asistente visual y expresiones emocionales adaptadas al mensaje de cada pantalla o modal:
- **Beti (`beti.png`):** Asistente institucional del **Tutor Responsable**.
- **Boti (`src/assets/icons/bot/adulto/boti_*.png`):** Compañero del **Modo Protegido Adulto** en 4 estados emocionales:
  - `feliz` (éxito, protección activa, puntaje alto en Quiz ≥ 80%).
  - `pensando` (preguntas del Quiz, búsqueda, información y configuración).
  - `nervioso` (advertencias de bloqueo irreversible, permisos pendientes, puntaje medio).
  - `triste` (intentos de desbloqueo restringidos, errores o puntaje bajo < 40%).
- **Botito (`src/assets/icons/bot/menor/botito_*.png`):** Compañero amigable del **Modo Protegido Menor** con los mismos 4 sentimientos (`feliz`, `pensando`, `nervioso`, `triste`) aplicados en *Inicio*, *Pasatiempos*, *Quiz*, *Sopa de letras*, *Juego de la memoria* y modales de feedback.

### 3. Botón Flotante con Tooltip Auto-Ocultable (`FabWithTooltip.tsx`)
- Bocadillo contextual (*"Bloquear sitio o app"*, *"Nuevo dispositivo"*) que se oculta automáticamente tras **3 segundos** para mantener limpia la interfaz.

---

## 📊 Home y Panel Ejecutivo Modular de Actividad (Modo Responsable)

### 1. Home Compacta del Responsable (`ParentInicioSection.tsx`)
Diseñada para visualizar el estado general sin necesidad de scroll:
- **Saludo personalizado** según franja horaria + primer nombre.
- **Card dinámico de estado:** `ESTÁS PROTEGIDO` (azul) o `DISPOSITIVO NO PROTEGIDO` (ámbar con conteo de permisos pendientes y acceso directo por `engrenaje.png`).
- **Card de Dispositivos protegidos:** Resumen limpio `X protegidos • Y inactivos` en la esquina superior derecha, fila de avatares ordenados A-Z, badge `"Yo"` al final cuando la autoprotección está activa y botón `+ Nuevo dispositivo` (si hay menos de 5 vinculados).
- **Cards simétricos de Sitios y Apps bloqueados** con acceso directo a cada sub-pestaña.
- **Gráfico histórico compacto** de intentos interceptados + enlace a **Preguntas frecuentes**.

### 2. Pestaña Actividad Modularizada (`src/components/dashboard/actividad/`)
Arquitectura limpia orquestada por `ActivitySection.tsx` + `useActivityDashboard.ts` y motor matemático en `src/utils/activityMetrics.ts`:
1. **`ActivityFiltersBar.tsx`:** Selector de **Dispositivo** (`Todos`, `Mi dispositivo` y dispositivos vinculados ordenados A-Z) y selector de **Período** (`Semana`, `Mes`, `Año`, `Total`).
2. **`TotalBlocksCard.tsx`:** KPI de **Bloqueos totales** con separador de miles y badge de variación porcentual respecto al período equivalente anterior (*ej. `+14% vs. semana previa`*).
3. **`BlocksBySourceCard.tsx`:** Barra proporcional al 100% y desglose entre **Lista LOTBA** y **Personalizada**.
4. **`HourlyAttemptsCard.tsx`:** Histograma apilado de **24 horas (`0 h` a `23 h`)** con detección automática de hora pico e inspección interactiva tocando cualquier barra horaria.
5. **`RecentAttemptsCard.tsx` + `BlockedAttemptRow.tsx`:** Lista de **Últimos intentos bloqueados** ordenada del más reciente al más antiguo con dominio, dispositivo, tiempo relativo y píldora de fuente.
6. **Modales Bottom Sheet Desacoplados:** `DeviceFilterSheetModal.tsx`, `PeriodFilterSheetModal.tsx` y `AllBlockedAttemptsModal.tsx` (*"Ver todo"*).

---

## 🌐 Gestión de Sitios y Apps + Trazabilidad de Origen

Módulo ubicado en `src/components/dashboard/sitios/` con hooks desacoplados (`useSitesManagement.ts` y `useAppsManagement.ts`):
- **Sub-pestañas `🌐 Sitios web` y `📱 Aplicaciones`:** CRUD completo, normalización de dominios, sugerencias rápidas de apps populares y límites diarios por dispositivo.
- **Toggle de Autoprotección + Aviso de Lista Vacía:** Incluye interruptor superior y banner informativo cuando aún no hay sitios ni apps cargados.
- **Identificador de Origen (`ADULTO_PROTEGIDO` vs. `RESPONSABLE`):**
  - Las tarjetas en `SitesTab.tsx` y `AppsTab.tsx` exhiben una etiqueta distintiva cuando el bloqueo fue agregado por un **Adulto protegido** (incluyendo su nombre/dispositivo).
  - El menú de 3 puntos (`SitesAppsOptionsMenuModal.tsx`) incorpora **Filtro rápido por origen** (`Todos`, `Responsable`, `Adulto protegido`), además de filtro por dispositivo, búsqueda, ordenamiento (`Recientes` / `A-Z`) y selección múltiple en lote.

---

## 🛡️ Dashboards Diferenciados: Modo Protegido Adulto vs. Modo Menor

`ProtectedDeviceScreen.tsx` adapta completamente la navegación, mascota, reglas y pantallas según el perfil vinculado:

### A. Modo Protegido Adulto (`src/components/dashboard/protected/adulto/`)
Barra inferior de 4 pestañas (`AdultoNavbar.tsx`): **`Inicio` · `Sitios y apps` · `Actividad` · `Cuenta`**
1. **`AdultoInicioSection.tsx`:** Réplica adaptada de la Home con saludo, bloque `DISPOSITIVO NO PROTEGIDO` (permisos), card de **Quiz diario con Boti** (una vez completado muestra puntaje y consejo saludable sin permitir repetirlo en el día), contadores de **Sitios** y **Apps** bloqueados con CTA `Ver`, resumen **Tiempo de uso de mis apps** y enlace a **Preguntas frecuentes**.
2. **`AdultoSitiosSection.tsx`:** Permite consultar elementos bloqueados, **buscar** y **ordenar** (`AdultoSitiosOptionsModal.tsx`) e **incluir nuevos sitios o apps** (`AdultoAddSiteModal.tsx`, `AdultoAddAppModal.tsx`) con advertencia previa con **Boti nervioso** explicando que solo el Responsable podrá desactivarlos o eliminarlos. No incluye Autoprotección ni opciones de edición/borrado.
3. **`AdultoActividadSection.tsx`:** Detalle diario de tiempo en pantalla por aplicación y hábitos digitales saludables.
4. **`AdultoCuentaSection.tsx`:** Perfil protegido (solo lectura), acceso a Permisos, Ayuda y soporte, Información legal y Cerrar sesión.

### B. Modo Protegido Menor (`src/components/dashboard/protected/menor/` y `juegos/`)
Barra inferior diferenciada de 4 pestañas (`MenorNavbar.tsx`): **`Inicio` · `Pasatiempos` · `Actividad` · `Cuenta`**
1. **`MenorInicioSection.tsx`:** Saludo dinámico, bloque `DISPOSITIVO NO PROTEGIDO`, **card dinámico de juego pendiente con Botito** (ofrece secuencialmente *Quiz* → *Sopa de letras* → *Juego de la memoria*, salteando los ya completados; al completar los 3 invita a salir con amigos o realizar actividades sin pantallas), banner preventivo *"SI SOS MENOR NO PODÉS INGRESAR A SITIOS DE APUESTAS"*, **Tiempo de uso de mis apps** y **Preguntas frecuentes**.
2. **`MenorPasatiemposSection.tsx` (`Pasatiempos`):**
   - Cabecera institucional con botón **Volver** hacia `Inicio`, título **"Pasatiempos"** y contador `X/3 completados`.
   - **3 Juegos Educativos (`src/components/dashboard/protected/juegos/`):**
     - **`QuizModal.tsx`:** Preguntas interactivas sobre seguridad digital y hábitos saludables con **Botito**.
     - **`WordSearchModal.tsx`:** **Sopa de letras** interactiva con tableros validados sin colisiones y selección por línea recta.
     - **`MemoryGameModal.tsx`:** **Juego de la memoria de 12 piezas (6 pares)** temáticos con contador de movimientos y festejo final con **Botito feliz**.
   - Todo juego completado queda **inactivo** (sin opción de rejugar) y se desplaza automáticamente al **final de la lista**.
3. **`MenorActividadSection.tsx` & `MenorCuentaSection.tsx`:** Visualización clara del tiempo de uso diario y pestaña Cuenta adaptada sin opciones administrativas del Responsable.

---

## 👤 Pestaña de Cuenta Unificada por Rol

- **En Modo Responsable (`src/components/dashboard/cuenta/`):** Incluye `ProfileSection` (Editar perfil + Vincular Google), `GlobalRulesSection` (Bloqueo LOTBA, Alertas, Antidesinstalación, Autoprotección, Permisos), `HelpSection` (Tutorial Onboarding y FAQ), `LegalSection` (Términos, Privacidad y `RatingModal` de evaluación), **Zona de Peligro** (Eliminar cuenta) y Cerrar sesión.
- **En Modos Protegidos Adulto y Menor (`AdultoCuentaSection.tsx` / `MenorCuentaSection.tsx`):** Replica el diseño institucional del Responsable conservando Perfil identificatorio, Permisos (solo activación), Ayuda y soporte, Información legal/evaluación, Cerrar sesión y versión oficial, **excluyendo estrictamente**: *Editar Perfil*, *Vincular Google*, *Reglas de protección global* y *Zona de Peligro*.

---

## ✨ Actualizaciones Recientes y Avances Técnicos

1. **Optimización de "Elegir protección" (`ResponsibleActionScreen.tsx` + `responsibleFirstAccess.ts`)**: Aparición única en el primer acceso del Responsable, apertura directa de `PairingModal` con redirección a Home al guardar, inicio en lista vacía para `Sitios y apps` con aviso contextual de Autoprotección y redirección automática a Home tras activarla.
2. **Modularización Completa de `ActivitySection` (`src/components/dashboard/actividad/`)**: Descomposición del panel ejecutivo en `useActivityDashboard`, 5 componentes de tarjetas (`ActivityFiltersBar`, `TotalBlocksCard`, `BlocksBySourceCard`, `HourlyAttemptsCard`, `RecentAttemptsCard` + `BlockedAttemptRow`) y 3 modales Bottom Sheet independientes.
3. **Mascotas Emocionales `Boti` y `Botito` (`botMascots.ts` + `botAssets.ts`)**: Integración de 8 ilustraciones PNG dedicadas (`feliz`, `pensando`, `nervioso`, `triste`) asignadas contextualmente en pantallas, juegos y `FeedbackModal.tsx`.
4. **Réplicas Adaptadas de Home y Cuenta para Adulto y Menor**: Consistencia visual de extremo a extremo entre los 3 perfiles operativos respetando los permisos y restricciones de cada rol.
5. **Pasatiempos con Juego de la Memoria de 12 Piezas e Inactivación Post-Victoria**: Reemplazo del antiguo rompecabezas por `MemoryGameModal.tsx` (6 pares / 12 cartas) y ordenamiento dinámico de juegos completados al final de la lista.
6. **Metadatos de Origen + Filtro en Sitios y Apps**: Sincronización de bloqueos creados por Adulto Protegido hacia la lista del Responsable con identificador visual y filtro dedicado.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                      # Proyecto nativo Android (Gradle, Kotlin, VpnService)
├── src/
│   ├── assets/                                   # Recursos gráficos oficiales
│   │   ├── icons/
│   │   │   ├── bot/                              # Mascotas oficiales por perfil y sentimiento
│   │   │   │   ├── beti.png                      # Mascota del Tutor Responsable
│   │   │   │   ├── adulto/                       # Boti (feliz, pensando, nervioso, triste)
│   │   │   │   └── menor/                        # Botito (feliz, pensando, nervioso, triste)
│   │   │   ├── navbar/                           # Íconos de barra de navegación inferior
│   │   │   └── *.png                             # Íconos UI (escudo, engrenaje, volver, alerta, etc.)
│   │   └── logo/                                 # Logos institucionales (logo_ba, logo_baprotege_texto, Google)
│   ├── components/
│   │   ├── auth/                                 # Login, Registro (+18), Recuperación, Ayuda y Modales Legales
│   │   ├── dashboard/
│   │   │   ├── inicio/                           # Home compacta del Responsable (ParentInicioSection)
│   │   │   ├── dispositivos/                     # Tarjetas de dispositivos, PairingModal, Autocontrol 24h y Auditoría
│   │   │   ├── sitios/                           # SitiosTab, AppsTab, Modales CRUD, Filtro de Origen y Hooks
│   │   │   │   └── hooks/                        # useSitesManagement.ts y useAppsManagement.ts
│   │   │   ├── actividad/                        # Panel Ejecutivo Modular de Actividad (5 bloques + 3 modales)
│   │   │   │   ├── hooks/useActivityDashboard.ts # Estado, carga de telemetría y derivación de métricas
│   │   │   │   ├── ActivitySection.tsx           # Orquestador modular de Actividad
│   │   │   │   ├── ActivityFiltersBar.tsx        # Bloque 1: Selector de Dispositivo y Período
│   │   │   │   ├── TotalBlocksCard.tsx           # Bloque 2: KPI Bloqueos totales y variación %
│   │   │   │   ├── BlocksBySourceCard.tsx        # Bloque 3: Lista LOTBA vs. Personalizada
│   │   │   │   ├── HourlyAttemptsCard.tsx        # Bloque 4: Histograma apilado 24h + hora pico
│   │   │   │   ├── RecentAttemptsCard.tsx        # Bloque 5: Últimos intentos bloqueados
│   │   │   │   ├── BlockedAttemptRow.tsx         # Fila reutilizable de intento bloqueado
│   │   │   │   ├── DeviceFilterSheetModal.tsx    # Bottom Sheet de filtro por dispositivo
│   │   │   │   ├── PeriodFilterSheetModal.tsx    # Bottom Sheet de selección de período
│   │   │   │   └── AllBlockedAttemptsModal.tsx   # Bottom Sheet "Ver todo" (historial completo)
│   │   │   ├── cuenta/                           # Perfil, Reglas globales, FAQ, Legal y RatingModal
│   │   │   ├── protected/                        # Dashboards diferenciados para dispositivos protegidos
│   │   │   │   ├── botAssets.ts                  # Mapa tipado de imágenes PNG para Boti y Botito
│   │   │   │   ├── adulto/                       # Navbar, Inicio, Sitios (buscar/ordenar/agregar), Actividad y Cuenta
│   │   │   │   ├── menor/                        # Navbar, Inicio dinámico, Pasatiempos, Actividad y Cuenta
│   │   │   │   └── juegos/                       # QuizModal, WordSearchModal y MemoryGameModal (12 piezas)
│   │   │   ├── DashboardNavbar.tsx               # Navbar de 5 pestañas del Responsable (#E5F1FF)
│   │   │   └── SeccionDesplegable.tsx            # Contenedor acordeón reutilizable
│   │   ├── ActionButton.tsx                      # Botón institucional con variantes
│   │   ├── Badge.tsx                             # Insignias semánticas de estado
│   │   ├── FabWithTooltip.tsx                    # FAB (+) con bocadillo auto-ocultable de 3s
│   │   ├── FeedbackModal.tsx                     # Modal unificado con soporte de mascotas emocionales
│   │   ├── Header.tsx                            # Cabecera #EAF3FF con botón Volver estandarizado
│   │   ├── Icon.tsx                              # Sistema unificado de íconos PNG
│   │   ├── PinKeyboard.tsx                       # Teclado numérico de PIN parental
│   │   ├── SplashScreen.tsx                      # Pantalla inicial animada
│   │   └── ToggleSwitch.tsx                      # Switch animado con soporte de estado deshabilitado
│   ├── data/
│   │   └── tutorialVideos.ts                     # Guiones y metadatos del Wizard de Onboarding
│   ├── screens/                                  # Orquestadores de pantallas principales
│   │   ├── OnboardingScreen.tsx                  # Paso 1: Wizard de 3 pasos + video optativo
│   │   ├── WelcomeScreen.tsx                     # Paso 2: Selección Responsable vs. Protegido
│   │   ├── LoginScreen.tsx                       # Paso 3A: Autenticación del Responsable
│   │   ├── PairingScreen.tsx                     # Paso 3B: Vinculación por código o QR
│   │   ├── PermissionsScreen.tsx                 # Paso 4: 6 Permisos del dispositivo Android
│   │   ├── ResponsibleActionScreen.tsx           # Paso 4.1: "Elegir protección" (solo 1er acceso)
│   │   ├── ParentDashboardScreen.tsx             # Paso 5A: Dashboard de 5 pestañas del Responsable
│   │   └── ProtectedDeviceScreen.tsx             # Paso 5B: Dashboard Adulto o Menor Protegido
│   ├── services/
│   │   ├── api/                                  # Módulos API (auth, devices, blocklist, selfControl, telemetry, client)
│   │   ├── api.service.ts                        # Fachada unificada retrocompatible
│   │   ├── googleAuth.service.ts                 # Integración Google Sign-In
│   │   ├── protection.service.ts                 # Puente JS <-> Kotlin ProtectionModule (6 permisos y motor VPN)
│   │   └── vpn.service.ts                        # Re-export retrocompatible a protection.service.ts
│   ├── theme/                                    # Paleta de colores y escala tipográfica
│   ├── types/                                    # Contratos e interfaces TypeScript globales
│   └── utils/                                    # Lógica pura de dominio testeable en Node
│       ├── activityMetrics.ts                    # Motor de cálculo de métricas, series 24h y períodos
│       ├── adultoSitios.ts                       # Búsqueda, ordenamiento y etiquetas de origen Adulto Protegido
│       ├── age.ts                                # Validación de mayoría de edad (+18)
│       ├── authValidation.ts                     # Validación de credenciales y formularios
│       ├── botMascots.ts                         # Selección contextual de sentimientos para Boti y Botito
│       ├── deviceColors.ts                       # Paleta persistente de colores por dispositivo
│       ├── pasatiempos.ts                        # Juegos, rotación en Inicio, Sopa de letras y Memoria (12 piezas)
│       ├── permissionChecker.ts                  # Verificación de los 6 permisos Android
│       └── responsibleFirstAccess.ts             # Persistencia de primer acceso y reglas de Autoprotección
└── tests/                                        # Suite de 116 pruebas unitarias (27 suites / 15 archivos)
    ├── activityMetrics.test.ts
    ├── adultoSitios.test.ts
    ├── ageValidation.test.ts
    ├── botMascots.test.ts
    ├── customApps.test.ts
    ├── customBlocklist.test.ts
    ├── dashboardNavbarAndPairing.test.ts
    ├── onboarding.test.ts
    ├── pasatiempos.test.ts
    ├── permissions.test.ts
    ├── responsibleFirstAccess.test.ts
    ├── selfControl.test.ts
    ├── theme.test.ts
    ├── types.test.ts
    └── uikit.test.ts
```

---

## ⚡ Guía de Instalación y Pruebas con APK

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Verificar Compilación de TypeScript (`0` errores)
```bash
npm run lint
```

### 3. Ejecutar la Suite Completa de Tests Automatizados (`116 tests / 27 suites`)
```bash
npm test
```

### 4. Generar el Bundle de Producción de React Native para Android
```bash
npm run build:bundle
```

### 5. Compilar la APK Debug
```bash
npm run build:apk
```
*El archivo APK generado se ubicará en:*
`android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Instalar y Ejecutar en Emulador o Celular Físico
```bash
npm run install:device
# O alternativamente:
npm run android
```
