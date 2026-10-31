# BA Protege+ — Frontend Mobile & Simulador Web

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile & Web Simulator
Archivo: frontend/README.md
Descripción: Documentación técnica completa, guía de instalación, Kit UI/UX,
             Flujo de 5 Pasos, Autenticación Modular, Modales Bottom Sheet Legales,
             Rediseño de Permisos con Acordeón y Cabecera #EAF3FF,
             Navegación de 5 Pestañas, Auditoría, Búsqueda, Ordenamiento,
             Dashboards de Protegido de 4 Módulos con Quiz Diario y Beti,
             FAB (+) con Bocadillo Tooltip Auto-Ocultable de 3s, Modal de Evaluación
             y Suite de Pruebas.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)** con **Modales Bottom Sheet Legales (`TermsModal` / `PrivacyModal`)** y selector de fecha (`DatePickerModal`), **Ingreso con Google e ícono oficial (`logo_google.png`)**, **Rediseño Completo de Permisos de Aplicación (`PermissionsScreen.tsx`)** con cabecera `#EAF3FF`, banner estilo *Card 1*, acordeón de 6 permisos del sistema Android y retorno deslogueado a `LoginForm`, **Estandarización del ícono `volver.png` en color negro**, **Navegación de 5 Pestañas con Resalte `#E5F1FF` y Nombres (`DashboardNavbar.tsx`)**, **Estructura Modular por Carpetas (`src/components/dashboard/`)**, **Búsqueda, Ordenamiento y Desvinculación de Dispositivos con Doble Confirmación**, **Optimización de Rendimiento con Caché en RAM (0ms)**, **Íconos e Isotipos Unificados (`logo_ba.png` / `logo_baprotege.png`)**, **Dashboards Especializados de 4 Módulos para Menor Protegido y Adulto en Tratamiento con Quiz Diario, Mascot Beti (`beti.png`) e Incentivo de Desconexión Outdoor**, **Botón Flotante (FAB `+`) con Bocadillo Tooltip Auto-Ocultable de 3 Segundos (`FabWithTooltip.tsx`)**, **Modal Bottom Sheet de Evaluación de la App (`RatingModal.tsx`)**, **Escudo Inteligente de Autocontrol del Responsable con inviolabilidad de bloqueos y cuenta regresiva de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService`, **Capa de Servicios API Modularizada (`src/services/api/`)** y un **Simulador Web Interactivo con Vite**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de 5 Pasos](#-flujo-ordenado-de-5-pasos)
3. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
4. [Rediseño de Selección de Modo (Paso 2)](#-rediseño-de-selección-de-modo-paso-2)
5. [Arquitectura de Autenticación, Google Auth y Modales Bottom Sheet](#-arquitectura-de-autenticación-google-auth-y-modales-bottom-sheet)
6. [Rediseño de Permisos de Aplicación y Geolocalización Híbrida (Paso 4)](#-rediseño-de-permisos-de-aplicación-y-geolocalización-híbrida-paso-4)
7. [Vinculación Dual por Código de 6 Dígitos y Escaneo QR](#-vinculación-dual-por-código-de-6-dígitos-y-escaneo-qr)
8. [Barra de Navegación de 5 Pestañas y Estructura Modular](#-barra-de-navegación-de-5-pestañas-y-estructura-modular)
9. [Búsqueda, Ordenamiento y Desvinculación con Doble Confirmación](#-búsqueda-ordenamiento-y-desvinculación-con-doble-confirmación)
10. [Isotipos Institucionales y Optimización de Rendimiento](#-isotipos-institucionales-y-optimización-de-rendimiento)
11. [Dashboards Especializados de 4 Módulos para Menor y Adulto Protegido](#-dashboards-especializados-de-4-módulos-para-menor-y-adulto-protegido)
12. [Estructura del Proyecto](#-estructura-del-proyecto)
13. [Guía de Instalación y Pruebas Rápida](#-guía-de-instalación-y-pruebas-rápida)

---

## 🛠️ Tecnologías y Arquitectura

- **Framework Móvil:** React Native 0.87 (TypeScript)
- **Sistema de Diseño:** Kit UI/UX oficial (`src/theme/` y `src/components/`)
- **Simulador Web:** Vite 8 + React 18 + TypeScript (puerto `5173`)
- **Capa Nativa Android:** Kotlin 2.x / Android SDK Platform 35/37 (Java 17)
- **Motor de Filtrado:** `android.net.VpnService` local con caché offline
- **Anti-Bypass & Resiliencia:** `BootReceiver` (`RECEIVE_BOOT_COMPLETED`) y validación de tiempo del servidor NTP (`getReliableTimestamp()`)
- **Servicios en Primer Plano:** `NotificationManager` con canal persistente de seguridad
- **Puente Nativo:** `ProtectionModule` (`ReactContextBaseJavaModule`)
- **Capa de Servicios API:** Modularizada en `src/services/api/` (`auth`, `devices`, `blocklist`, `selfControl`, `telemetry`) con fachada unificada `apiService`
- **Cliente HTTP:** Axios con interceptores JWT, caché en memoria RAM (`Map`) e instantes de espera optimizados (`timeout: 1000ms`)

---

## 🔄 Flujo Ordenado de 5 Pasos

La aplicación se navega a través de un flujo estructurado de 5 fases principales (`App.tsx` y `WebSimulator.tsx`):

```text
┌──────────────────────────────────────────────────────────────────┐
│ PASO 1: ONBOARDING Y VIDEO TUTORIAL OFICIAL (35 SEC)             │
└────────────────┬─────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASO 2: SELECCIÓN DE MODO OPERATIVO (Sin scroll / Armonizado)   │
│ - Modo responsable (Escudo) vs Modo protegido (Corazón)          │
└────────────────┬────────────────────────────────┬────────────────┘
                 │                                │
                 ▼                                ▼
┌─────────────────────────────────┐    ┌──────────────────────────┐
│ PASO 3A: MODO RESPONSABLE       │    │ PASO 3B: MODO PROTEGIDO  │
│ - Crear Cuenta (+18) / Login    │    │ - Código 123456 (Menor)  │
│ - Opción Google / Términos      │    │ - Código 654321 (Adulto) │
└────────────────┬────────────────┘    └────────────┬─────────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASO 4: PANTALLA DE PERMISOS DE ANDROID (Post-Login / Pairing)   │
│ - Configuración y explicación con Secciones Desplegables         │
└────────────────┬─────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────┴─────────────────────────────────┐
│ PASO 5: PANTALLA PRINCIPAL DE DESTINO                            │
│ - Paso 5A: Dashboard Responsable (5 Pestañas: Panel, Dispositivos│
│   Sitios, Actividad, Cuenta)                                     │
│ - Paso 5B: Dispositivo Protegido (4 Módulos: Actividad, Inicio,  │
│   Sitios y apps, Cuenta)                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📜 Reglas de Negocio Implementadas

Para garantizar un control seguro y estructurado de los dispositivos protegidos, se han implementado las siguientes reglas de negocio tanto a nivel UI como en servicios de API:

1. **Límite de Dispositivos Protegidos:** Un Tutor / Responsable puede vincular y controlar un máximo de **5 dispositivos protegidos** (`MAX_PROTECTED_DEVICES = 5`). Al alcanzar este límite, la interfaz de vinculación de nuevos dispositivos se deshabilita automáticamente.
2. **Autocontrol del Responsable con Escudo Inteligente y Bloqueo de 24 Horas:**
   - El Responsable cuenta como un dispositivo propio (`self`). Puede habilitar la función de **Autocontrol**, integrada como un escudo inteligente (`escudo.png`) directamente en la cabecera de su tarjeta de dispositivo al lado del botón de editar.
   - **Inviolabilidad de Bloqueos:** Mientras el autocontrol esté activo, el responsable **no puede desactivar, pausar ni eliminar** ningún sitio web ni aplicación bloqueada asignada a su propio dispositivo. Tampoco puede desmarcar su dispositivo en los modales de edición.
   - **Espera Obligatoria de 24 Horas:** Al solicitar la desactivación, se inicia un período de espera preventivo de 24 horas con un **cronómetro dinámico en tiempo real (`Xh Ym Zs`)** que impide desactivaciones impulsivas. Cumplidas las 24 horas, se habilita un pase temporal de desbloqueo de 24 horas antes del rebloqueo automático.
3. **Listas de Bloqueo Granulares de Sitios y Aplicaciones:** El Tutor tiene la capacidad de crear y gestionar listas de sitios web y aplicaciones móviles bloqueadas de forma **personalizada por cada dispositivo**. Cada regla puede ser asignada específicamente a uno o varios dispositivos elegidos (incluyendo el suyo).
4. **Auditoría y Monitoreo de 6 Permisos del Sistema Android:**
   - Supervisión en tiempo real de los 6 permisos clave requeridos por el sistema (`permissionChecker.ts`):
     1. *Servicio VPN (Filtrado LOTBA)*
     2. *Accesibilidad (Antidesinstalación)*
     3. *Notificaciones en primer plano*
     4. *Sin optimización de batería*
     5. *Ubicación (Geolocalización segura)*
     6. *Acceso al uso (Límites de tiempo de apps)*
   - Posibilidad de auditar el celular propio desde el card del responsable, navegando directamente a `PermissionsScreen.tsx` para completar permisos pendientes.
5. **Reglas Globales Obligatorias y Opcionales:**
   - Se incluye una regla inmutable y siempre activa para el **Bloqueo Oficial de sitios LOTBA** en todos los dispositivos de la red familiar (sin excepción).
   - El responsable puede crear nuevas reglas personalizadas de sitios o apps y, mediante un switch de control en la UI, decidir que dicho bloqueo se aplique de manera **Global a todos los dispositivos** (incluyendo el suyo) de forma simultánea.
6. **Estandarización de Interfaz en Sentence Case:** Aplicación estricta de la norma de capitalización de frases en todos los títulos, subtítulos, botones e ítemes del panel (*"Gestión de sitios y apps"*, *"Mis dispositivos protegidos"*, *"Actividad del sistema"*, *"Autocontrol del responsable"*).
7. **Modales Accesibles y Agrupados:** Modales Bottom Sheet con botón de cierre **"✕"**, imagen oficial de `beti.png` y botones de acción paralelos organizados horizontalmente en una misma fila (`flexDirection: 'row'`, `gap: 12`).

---

## 🎨 Sistema de Diseño y Kit UI/UX

El proyecto cuenta con un **Kit UI/UX estandarizado** basado en las especificaciones oficiales de la carpeta `frontend/ui/` (`uikit.txt` e íconos oficiales PNG en `src/assets/icons/`):

### 1. Tokens de Color Oficiales
- **Primary (`#007AFF`):** Botones principales, encabezados, selección de modo y elementos activos.
- **Primary Light (`#E7F1FF`):** Fondos de avisos, tarjetas de resumen y resaltes de selecciones.
- **Active Navbar Highlight (`#E5F1FF`):** Fondo con bordes suaves (`borderRadius: 12`) para la pestaña activa de la barra de navegación.
- **Secondary (`#28A745`):** Estado de protección activa, confirmaciones y operaciones exitosas.
- **Text Primary (`#1C1C1E`):** Títulos, encabezados y texto principal sobre fondo claro.
- **Text Secondary (`#8E8E93` / `#64748B`):** Subtítulos, textos secundarios, bordes e íconos deshabilitados.
- **Background (`#F8F9FA`):** Fondo general de las pantallas y contenedores de tarjetas.
- **Feedback / Error (`#DC3545`):** Sitios bloqueados, alertas críticas y desvinculación.
- **Feedback / Warning (`#FFC107`):** Advertencias de vinculación y avisos de temporizadores.

### 2. Botón Flotante con Bocadillo Tooltip Auto-Ocultable (`FabWithTooltip.tsx`)
- **Bocadillo explicativo:** Tarjeta blanca con texto dinámico (*"Bloquear sitio o app"*, *"Nuevo dispositivo"*) y triángulo indicador apuntando hacia el botón flotante circular `+`.
- **Auto-ocultamiento a los 3 segundos:** Al aparecer en pantalla, el bocadillo Tooltip permanece visible durante **3 segundos** y luego se oculta automáticamente para mantener la pantalla limpia de obstrucciones visuales.

---

## ⚙️ Módulo Avanzado de Gestión de Sitios y Apps (`CustomSitesSection.tsx`)

1. **Sub-pestañas Especializadas:**
   - **`🌐 Sitios web`:** Administración de dominios web con filtro oficial LOTBA inmutable + listas personalizadas.
   - **`📱 Aplicaciones`:** Restricción de aplicaciones móviles Android (Bet365, TikTok, Instagram, Free Fire, etc.) mediante el servicio de accesibilidad.

2. **Menú de Opciones de 3 Puntos (⋮) y Limpieza Visual:**
   - Menú emergente desplegable que reúne las 5 herramientas de gestión: `📱 Filtrar por dispositivo`, `🔍 Buscar`, `📅 Ordenar por fecha`, `🔤 Ordenar A-Z` y `☑️ Selección múltiple`.

3. **Botón Flotante (FAB `+`) con Tooltip Explicativo:**
   - Botón flotante `+` con el bocadillo explicativo *"Bloquear sitio o app"* que desaparece a los 3 segundos.

---

## 👤 Pestaña de Cuenta del Responsable y Modal de Evaluación

1. **Perfil del Responsable (`ProfileSection.tsx`):**
   - Avatar estandarizado con el asistente **Beti** (`beti.png`) y color institucional **Azul (`#007AFF`)**.
2. **Información Legal y Valoración (`LegalSection.tsx`, `RatingModal.tsx`):**
   - Agrupa en un único contenedor los enlaces a los modales Bottom Sheet de **Términos y condiciones** (`TermsModal.tsx`), **Política de privacidad** (`PrivacyModal.tsx`) y el nuevo **Modal de Evaluación de la Aplicación (`RatingModal.tsx`)**.
   - El `RatingModal` permite calificar con 5 estrellas interactivas, ingresar sugerencias para `baprotegemas@gmail.com` y redirigir a **Google Play Store**.

---

## 🛡️ Dashboards Especializados de 4 Módulos para Menor y Adulto Protegido

El dispositivo protegido (`ProtectedDeviceScreen.tsx` y `ProtectedDeviceStep.tsx`) cuenta con una barra de navegación inferior exclusiva de **4 módulos (`ProtectedNavbar.tsx`)**:

```text
  [ 📊 Actividad ]   [ 🏠 Inicio ]   [ 🌐 Sitios y apps ]   [ 👤 Cuenta ]
```

### 1. Módulo "Inicio" (Pestaña Central por Defecto)
- **Tarjeta de Estado:** `"Estás protegido"` con confirmación de vinculación con responsable (*Ana*).
- **Quiz Diario Interactivo con Beti (`QuizModal.tsx`):**
  - Cuestionario de 5 preguntas x 4 opciones desordenadas aleatoriamente (Fisher-Yates shuffle) por sesión.
  - Botones de navegación **`◄ Volver`** y **`Avanzar ►` / `Finalizar ➔`**, con botón **`X`** de cierre que **conserva el progreso** (reanuda en la misma pregunta al reabrir).
  - **Incentivo de Desconexión Outdoor:** Pantalla final con Beti, tilde verde de éxito e incentivo explícito para desconectarse (*"🌳 ¡Momento de desconectarte! Te sugerimos tomar un descanso de la pantalla, salir a pasear y disfrutar del aire libre ☀️🚶"*).
  - La tarjeta de Inicio se actualiza al completar el quiz mostrando el puntaje y el consejo de paseo al aire libre.
- **Banner Rojo de Advertencia:** Presenta a Beti con un escudo e información pedagógica para prevenir el acceso a contenidos no adecuados.

### 2. Módulo "Sitios y apps" (Pestaña `sitios`)
- **Visualización Exclusiva:** Muestra **únicamente los sitios web y aplicaciones que el usuario protegido ha bloqueado en su propio dispositivo**.
- **Restricción Estricta de Desbloqueo:** Cada elemento bloqueado cuenta con la leyenda `"🔒 Bloqueado permanentemente por responsable"`. El usuario protegido **NO puede desbloquearlo**; intentar hacerlo despliega la solicitud de **PIN del Tutor Responsable (1234)**.
- **Botón Flotante FAB `+` Exclusivo:** El botón flotante `+` con el bocadillo de texto `"Bloquear sitio o app"` (visible por 3s) aparece **únicamente en este módulo**.

### 3. Módulo "Actividad" (`actividad`)
- **MI USO DIARIO:** Resumen visual de tiempo de pantalla acumulado hoy, tarjetas estadísticas con el robot Beti y barras de consumo diario por aplicación (Instagram, TikTok, YouTube).

### 4. Módulo "Cuenta" (`cuenta`)
- Detalles del perfil del dispositivo, tutor vinculado, estado del filtro VPN y botón de llamada directa a la **Línea Gratuita de Orientación 24hs (0800-444-5682)**.

---

## ✨ Actualizaciones Recientes y Nuevos Módulos

1. **Modularización de la Capa de Servicios API (`src/services/api/`)**:
   - Desacoplamiento de la lógica de red y almacenamiento en servicios especializados (`auth.api.ts`, `devices.api.ts`, `blocklist.api.ts`, `selfControl.api.ts`, `telemetry.api.ts` y `client.ts`).
   - Mantenimiento de la fachada unificada retrocompatible [`apiService`](file:///C:/Projetos/baprotege+/frontend/src/services/api.service.ts).
2. **Escudo Inteligente de Autocontrol y Cronómetro Dinámico en Segundos**:
   - Transformación del bloque de autocontrol del tutor en un ícono de escudo inteligente (`escudo.png`) al lado del botón de editar en [`DeviceCard.tsx`](file:///C:/Projetos/baprotege+/frontend/src/components/dashboard/dispositivos/DeviceCard.tsx).
   - Inviolabilidad de las reglas de bloqueo para el dispositivo del propio responsable mientras el autocontrol esté activo.
   - Cronómetro de cuenta regresiva en vivo que calcula horas, minutos y segundos exactos (`Xh Ym Zs`), con sondeo periódico de 10 segundos en [`ParentDashboardScreen.tsx`](file:///C:/Projetos/baprotege+/frontend/src/screens/ParentDashboardScreen.tsx).
3. **Modales Bottom Sheet y Rediseño de Formularios de Sitios y Apps**:
   - Transformación de los modales de agregar y editar sitios y aplicaciones en formato Bottom Sheet respetando el estándar del sistema.
   - Estandarización del ícono de flecha desplegable en color azul oficial (`#007AFF`) y remoción de badges redundantes en la selección de dispositivos.
4. **Paleta de Colores Persistente por Dispositivo**:
   - Cada dispositivo vinculado conserva su color asignado de forma inmutable, garantizando consistencia visual en todas las vistas y modales.
5. **Formularios Limpios y Selección Total de Texto al Enfocar**:
   - Eliminación de fondos grises en formularios (`PairingSection.tsx`) y soporte para `selectTextOnFocus` en inputs numéricos y de texto para facilitar la edición.
6. **Auditoría de 6 Permisos Android en Tiempo Real (`permissionChecker.ts`)**:
   - Supervisión activa de permisos en dispositivos vinculados con enlace directo hacia [`PermissionsScreen.tsx`](file:///C:/Projetos/baprotege+/frontend/src/screens/PermissionsScreen.tsx) para activar permisos pendientes.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin, Mipmaps)
├── src/
│   ├── assets/                               # Recursos gráficos oficiales
│   │   ├── icons/                            # Íconos PNG (navbar, volver, editar, eliminar, escudo, bot/beti.png, etc.)
│   │   └── logo/                             # Isotipos oficiales (logo_ba.png, logo_baprotege.png, logo_google.png)
│   ├── components/                           # Componentes del Kit UI/UX
│   │   ├── auth/                             # Módulo de Autenticación Modular
│   │   │   ├── DatePickerModal.tsx           # Modal interactivo de selección de fecha/calendario
│   │   │   ├── LegalModal.styles.ts          # Estilos de Bottom Sheet para modales legales
│   │   │   ├── LoginForm.tsx                 # Formulario de Inicio de Sesión (Google Auth)
│   │   │   ├── PrivacyModal.tsx              # Modal Bottom Sheet de Políticas de Privacidad
│   │   │   ├── RecoveryForm.tsx              # Formulario con diseño dual de botones de Onboarding
│   │   │   ├── RegisterForm.tsx              # Formulario (+18, Google Auth, Términos y Calendario)
│   │   │   └── TermsModal.tsx                # Modal Bottom Sheet de Términos y Condiciones
│   │   ├── dashboard/                        # Módulos Modulares del Dashboard
│   │   │   ├── actividad/                    # Sección de Registro de Actividad
│   │   │   ├── cuenta/                       # Permisos, Perfil, Ayuda, Legal y RatingModal
│   │   │   │   ├── EditResponsibleModal.tsx  # Modal institucional de edición del perfil del responsable
│   │   │   │   ├── HelpSection.tsx           # Asistencia y canales de contacto oficial
│   │   │   │   ├── LegalSection.tsx          # Información legal, términos, privacidad y valoración
│   │   │   │   ├── ProfileSection.tsx        # Perfil del tutor responsable con avatar y edición
│   │   │   │   ├── RatingModal.tsx           # Modal Bottom Sheet de evaluación de la app en Play Store
│   │   │   │   ├── RatingSection.tsx         # Sección de valoración en pantalla
│   │   │   │   └── TutorPermissionsSection.tsx # Resumen de permisos del responsable
│   │   │   ├── dispositivos/                 # Dispositivos vinculados, Auditoría, Autocontrol y Pairing
│   │   │   │   ├── DeviceCard.tsx            # Tarjeta individual con colores persistentes, 6 permisos y escudo de autocontrol
│   │   │   │   ├── EditProtectedDeviceModal.tsx # Modal con estilo y validaciones para editar datos del protegido
│   │   │   │   ├── PairingModal.tsx          # Modal Bottom Sheet para vincular nuevo dispositivo
│   │   │   │   ├── PairingSection.tsx        # Formulario de vinculación con inputs limpios y código QR
│   │   │   │   ├── ProtectedDevicesSection.tsx # Vista orquestadora modular de dispositivos vinculados
│   │   │   │   ├── SelfControlSection.tsx    # Componente modal de confirmación guiada de Autocontrol 24h
│   │   │   │   └── UnbindConfirmationModal.tsx # Modal de doble confirmación de desvinculación
│   │   │   ├── protected/                    # Sub-módulo para el Usuario Protegido (Menor / Adulto)
│   │   │   │   ├── BlockModal.tsx            # Modal de bloqueo rápido desplegado desde FAB +
│   │   │   │   ├── ProtectedActividadSection.tsx  # Pestaña "MI USO DIARIO"
│   │   │   │   ├── ProtectedCuentaSection.tsx     # Pestaña Cuenta del protegido con 0800-444-5682
│   │   │   │   ├── ProtectedInicioSection.tsx     # Pestaña Inicio con Quiz diario y Beti
│   │   │   │   ├── ProtectedNavbar.tsx            # Navbar de 4 módulos para protegido
│   │   │   │   ├── ProtectedSitiosSection.tsx     # Pestaña "Sitios y apps" bloqueadas por el usuario
│   │   │   │   └── QuizModal.tsx                  # Modal interactivo de Quiz con shuffle e incentivo outdoor
│   │   │   ├── sitios/                       # Reglas Globales y CRUD de Sitios y Apps Bloqueadas
│   │   │   │   ├── AddAppModal.tsx           # Modal Bottom Sheet para bloquear app (Top 15 Play Store y límites)
│   │   │   │   ├── AddSiteModal.tsx          # Modal Bottom Sheet para bloquear dominio/sitio web
│   │   │   │   ├── AppTimeLimitModal.tsx     # Modal Bottom Sheet para configurar límite diario de app
│   │   │   │   ├── AppsTab.tsx               # Sub-pestaña especializada en aplicaciones móviles
│   │   │   │   ├── CustomSitesSection.tsx    # Orquestador principal de sitios y apps con bloqueo de Autocontrol
│   │   │   │   ├── EditAppModal.tsx          # Modal Bottom Sheet para editar app y dispositivos asignados
│   │   │   │   ├── EditSiteModal.tsx         # Modal Bottom Sheet para editar sitio web y regla de asignación
│   │   │   │   ├── GlobalRulesSection.tsx    # Regla inmutable oficial de LOTBA
│   │   │   │   ├── SitesOptionsMenuModal.tsx # Menú modal de 3 puntos (⋮) para filtros y orden
│   │   │   │   └── SitesTab.tsx              # Sub-pestaña especializada en sitios web
│   │   │   ├── DashboardNavbar.tsx           # Navbar 5 Pestañas con Resalte #E5F1FF y centrado vertical
│   │   │   └── SeccionDesplegable.tsx        # Contenedor Desplegable con Badges
│   │   ├── ActionButton.tsx                  # Botón con variantes primario/secundario y estados de carga
│   │   ├── Badge.tsx                         # Etiquetas de estado (activo, inactivo, atención, peligro)
│   │   ├── FabWithTooltip.tsx                # Botón Flotante FAB + con Tooltip de 3 segundos
│   │   ├── Header.tsx                        # Encabezado con ícono Volver negro y logo_ba.png
│   │   ├── Icon.tsx                          # Componente unificado de íconos PNG
│   │   ├── Logo.tsx                          # Logotipo oficial (logo_baprotege.png)
│   │   └── ToggleSwitch.tsx                  # Interruptor accesible con animación fluida
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Orquestador liviano de Autenticación
│   │   ├── OnboardingScreen.tsx              # Onboarding con video tutorial oficial
│   │   ├── PairingScreen.tsx                 # Pareamiento por 6 dígitos o QR (123456 / 654321)
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable modularizado
│   │   ├── PermissionsScreen.tsx             # Pantalla de 6 permisos Android con acordeón y GPS
│   │   └── ProtectedDeviceScreen.tsx         # Panel del protegido de 4 módulos (Menor / Adulto)
│   ├── services/                             # Lógica de comunicación y arquitectura de datos modular
│   │   ├── api/                              # Capa de servicios API modularizada
│   │   │   ├── auth.api.ts                   # Autenticación, login, registro y usuario actual
│   │   │   ├── blocklist.api.ts              # CRUD de dominios y apps bloqueadas, reglas y límites
│   │   │   ├── client.ts                     # Cliente Axios con interceptores JWT y caché en RAM
│   │   │   ├── devices.api.ts                # Dispositivos vinculados, pairing y desvinculación
│   │   │   ├── selfControl.api.ts            # Máquina de estados de Autocontrol, cooldown 24h y cronómetro dinámico
│   │   │   ├── telemetry.api.ts              # Registro de eventos, intentos de acceso y métricas
│   │   │   └── index.ts                      # Barrel export de módulos API
│   │   ├── api.service.ts                    # Fachada API unificada retrocompatible (`apiService`)
│   │   ├── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   │   └── index.ts                          # Exportación centralizada de servicios
│   ├── theme/                                # Tokens de diseño e interfaz del Kit UI/UX
│   │   ├── colors.ts                         # Paleta oficial, variantes light y estados de alerta
│   │   ├── typography.ts                     # Escala tipográfica oficial y pesos
│   │   └── index.ts                          # Barrel export del tema
│   ├── utils/                                # Utilidades transversales y validadores
│   │   ├── age.ts                            # Cálculo de edad y validación de mayoría de edad (+18)
│   │   ├── authValidation.ts                 # Validadores de correo, contraseñas y campos de registro
│   │   ├── deviceColors.ts                   # Asignación persistente de paleta de colores/avatares y URL regex
│   │   └── permissionChecker.ts              # Auditoría y verificación de los 6 permisos Android en tiempo real
│   ├── web/                                  # Simulador Web Interactivo (Vite 8 + React 18)
│   │   ├── components/                       # Componentes espejo para simulación Web
│   │   └── WebSimulator.tsx                  # Orquestador del Simulador Web
├── tests/                                    # Pruebas unitarias automatizadas (55 tests / 11 suites)
```

---

## ⚡ Guía de Instalación y Pruebas Rápida

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Verificar Compilación de TypeScript
```bash
npm run lint
```

### 3. Ejecutar la Suite Completa de Tests Automatizados (55 tests / 11 suites)
```bash
npm test
```

### 4. Iniciar el Simulador Web
```bash
npm run dev
```

### 5. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**

