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

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)** con **Modales Bottom Sheet Legales (`TermsModal` / `PrivacyModal`)** y selector de fecha (`DatePickerModal`), **Ingreso con Google e ícono oficial (`logo_google.png`)**, **Rediseño Completo de Permisos de Aplicación (`PermissionsScreen.tsx`)** con cabecera `#EAF3FF`, banner estilo *Card 1*, acordeón de 5 permisos y retorno deslogueado a `LoginForm`, **Estandarización del ícono `volver.png` en color negro**, **Navegación de 5 Pestañas con Resalte `#E5F1FF` y Nombres (`DashboardNavbar.tsx`)**, **Estructura Modular por Carpetas (`src/components/dashboard/`)**, **Búsqueda, Ordenamiento y Desvinculación de Dispositivos con Doble Confirmación**, **Optimización de Rendimiento con Caché en RAM (0ms)**, **Íconos e Isotipos Unificados (`logo_ba.png` / `logo_baprotege.png`)**, **Dashboards Especializados de 4 Módulos para Menor Protegido y Adulto en Tratamiento con Quiz Diario, Mascot Beti (`beti.png`) e Incentivo de Desconexión Outdoor**, **Botón Flotante (FAB `+`) con Bocadillo Tooltip Auto-Ocultable de 3 Segundos (`FabWithTooltip.tsx`)**, **Modal Bottom Sheet de Evaluación de la App (`RatingModal.tsx`)**, **Autocontrol del Tutor con bloqueo de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService` y un **Simulador Web Interactivo con Vite**.

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
2. **Autocontrol del Responsable:** El Tutor cuenta como un sexto (6º) dispositivo (su propio dispositivo). Puede habilitar la función de **Autocontrol**, la cual aplica filtros de bloqueo en su propia cuenta de manera permanente. Si desea desactivarla, el sistema impone un **bloqueo preventivo obligatorio de 24 horas** de espera para evitar desactivaciones impulsivas.
3. **Listas de Bloqueo Granulares de Sitios y Aplicaciones:** El Tutor tiene la capacidad de crear y gestionar listas de sitios web y aplicaciones móviles bloqueadas de forma **personalizada por cada dispositivo**. Cada regla puede ser asignada específicamente a uno o varios dispositivos elegidos (incluyendo el suyo).
4. **Monitorización de Tiempo de Uso de Pantalla:** Registro e historial visual del consumo diario de minutos de cada aplicación (Instagram, TikTok, Free Fire, Bet365, etc.) por dispositivo.
5. **Reglas Globales Obligatorias y Opcionales:**
   - Se incluye una regla inmutable y siempre activa para el **Bloqueo Oficial de sitios LOTBA** en todos los dispositivos de la red familiar (sin excepción).
   - El responsable puede crear nuevas reglas personalizadas de sitios o apps y, mediante un switch de control en la UI, decidir que dicho bloqueo se aplique de manera **Global a todos los dispositivos** (incluyendo el suyo) de forma simultánea.
6. **Estandarización de Interfaz en Sentence Case:** Aplicación estricta de la norma de capitalización de frases en todos los títulos, subtítulos, botones e ítemes del panel (*"Gestión de sitios y apps"*, *"Mis dispositivos protegidos"*, *"Actividad del sistema"*, *"Autocontrol del tutor"*).
7. **Modales Accesibles y Agrupados:** Modales con botón de cierre **"✕"**, imagen oficial de `beti.png` y botones de acción paralelos organizados horizontalmente en una misma fila (`flexDirection: 'row'`, `gap: 12`).

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

1. **Botón Flotante con Bocadillo Tooltip de 3 Segundos (`FabWithTooltip.tsx`)**:
   - Componente desacoplado que exhibe un bocadillo de texto dinámico con flecha hacia el botón `+` y auto-ocultamiento a los 3 segundos.
2. **Modal Bottom Sheet de Evaluación (`RatingModal.tsx`)**:
   - Transformación de la sección de evaluación en un modal en formato Bottom Sheet integrado dentro de *Información legal y valoración*.
3. **Estandarización de Sentence Case**:
   - Aplicación rigurosa de normas de capitalización de oraciones en todos los textos de la carpeta `src/components/dashboard/protected/` y en `PermissionsScreen.tsx`.
4. **Vinculación Temporal Offline por Código**:
   - Código `123456` para vinculación en perfil **Menor (`CHILD`)** y `654321` para perfil **Adulto (`ADULT`)**.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin, Mipmaps)
├── src/
│   ├── assets/                               # Recursos gráficos oficiales
│   │   ├── icons/                            # Íconos PNG (navbar, volver, ojo, bot/beti.png, etc.)
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
│   │   ├── dashboard/                        # Módulo Modular del Dashboard
│   │   │   ├── actividad/                    # Sección de Registro de Actividad
│   │   │   ├── cuenta/                       # Autocontrol, Permisos, Perfil, Ayuda, Legal y RatingModal
│   │   │   │   ├── HelpSection.tsx
│   │   │   │   ├── LegalSection.tsx          # Información legal y valoración
│   │   │   │   ├── ProfileSection.tsx
│   │   │   │   ├── RatingModal.tsx           # Modal Bottom Sheet de evaluación de la app
│   │   │   │   ├── SelfControlSection.tsx
│   │   │   │   └── TutorPermissionsSection.tsx
│   │   │   ├── dispositivos/                 # Auditoría, Buscador, Orden, Doble Confirmación y Pairing
│   │   │   ├── protected/                    # Sub-módulo para el Usuario Protegido (Menor / Adulto)
│   │   │   │   ├── BlockModal.tsx            # Modal de bloqueo rápido desplegado desde FAB +
│   │   │   │   ├── ProtectedActividadSection.tsx  # Pestaña "MI USO DIARIO"
│   │   │   │   ├── ProtectedCuentaSection.tsx     # Pestaña Cuenta del protegido con 0800-444-5682
│   │   │   │   ├── ProtectedInicioSection.tsx     # Pestaña Inicio con Quiz diario y Beti
│   │   │   │   ├── ProtectedNavbar.tsx            # Navbar de 4 módulos para protegido
│   │   │   │   ├── ProtectedSitiosSection.tsx     # Pestaña "Sitios y apps" bloqueadas por el usuario
│   │   │   │   └── QuizModal.tsx                  # Modal interactivo de Quiz con shuffle e incentivo outdoor
│   │   │   ├── sitios/                       # Reglas Globales y CRUD de Sitios Personalizados
│   │   │   ├── DashboardNavbar.tsx           # Navbar 5 Pestañas con Resalte #E5F1FF
│   │   │   └── SeccionDesplegable.tsx        # Contenedor Desplegable con Badges
│   │   ├── ActionButton.tsx                  # Botón con variantes
│   │   ├── Badge.tsx                         # Etiquetas de estado
│   │   ├── FabWithTooltip.tsx                # Botón Flotante FAB + con Tooltip de 3 segundos
│   │   ├── Header.tsx                        # Encabezado con ícono Volver negro y logo_ba.png
│   │   ├── Icon.tsx                          # Componente unificado de íconos PNG
│   │   └── Logo.tsx                          # Logotipo oficial (logo_baprotege.png)
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Orquestador liviano de Autenticación
│   │   ├── OnboardingScreen.tsx              # Onboarding con video tutorial oficial
│   │   ├── PairingScreen.tsx                 # Pareamiento por 6 dígitos o QR (123456 / 654321)
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable modularizado
│   │   ├── PermissionsScreen.tsx            # Pantalla de 5 permisos con acordeón y GPS
│   │   └── ProtectedDeviceScreen.tsx         # Panel del protegido de 4 módulos (Menor / Adulto)
│   ├── services/                             # Lógica de comunicación y puentes
│   │   ├── api.service.ts                    # API Client, RAM Cache (0ms), Server Time, Autocontrol y Unbind
│   │   └── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   ├── theme/                                # Tokens de diseño e interfaz del Kit UI/UX
│   ├── web/                                  # Simulador Web Interactivo (Vite 8 + React 18)
│   │   ├── components/                       # Componentes espejo para simulación Web
│   │   └── WebSimulator.tsx                  # Orquestador del Simulador Web
├── tests/                                    # Pruebas unitarias automatizadas (51 tests / 11 suites)
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

### 3. Ejecutar la Suite Completa de Tests Automatizados (51 tests / 11 suites)
```bash
npm test
```

### 4. Iniciar el Simulador Web
```bash
npm run dev
```

### 5. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**
