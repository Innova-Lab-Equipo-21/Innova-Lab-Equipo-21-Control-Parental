# BA Protege+ — Frontend Mobile & Simulador Web

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile & Web Simulator
Archivo: frontend/README.md
Descripción: Documentación técnica completa, guía de instalación, Kit UI/UX,
             Flujo de 5 Pasos, Autenticación Modular, Navegación de 5 Pestañas,
             Auditoría, Búsqueda, Ordenamiento y Desvinculación con Doble Confirmación,
             Optimización de Rendimiento y Suite de 45 Tests Automatizados.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)**, **Ingreso con Google e ícono oficial (`logo_google.png`)**, **Aceptación y Modales de Términos Legales y Privacidad**, **Navegación de 5 Pestañas con Resalte `#E5F1FF` y Nombres (`DashboardNavbar.tsx`)**, **Estructura Modular por Carpetas (`src/components/dashboard/`)**, **Búsqueda, Ordenamiento y Desvinculación de Dispositivos con Doble Confirmación**, **Optimización de Rendimiento con Caché en RAM (0ms)**, **Íconos e Isotipos Unificados (`logo_ba.png` / `logo_baprotege.png`)**, **Dashboards Especializados para Menor Protegido y Adulto en Tratamiento**, **Autocontrol del Tutor con bloqueo de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService` y un **Simulador Web Interactivo con Vite**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de 5 Pasos](#-flujo-ordenado-de-5-pasos)
3. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
4. [Rediseño de Selección de Modo (Paso 2)](#-rediseño-de-selección-de-modo-paso-2)
5. [Arquitectura de Autenticación, Google Auth y Términos Legales](#-arquitectura-de-autenticación-google-auth-y-términos-legales)
6. [Configuración de Permisos y Geolocalización Híbrida (Paso 4)](#-configuración-de-permisos-y-geolocalización-híbrida-paso-4)
7. [Vinculación Dual por Código de 6 Dígitos y Escaneo QR](#-vinculación-dual-por-código-de-6-dígitos-y-escaneo-qr)
8. [Barra de Navegación de 5 Pestañas y Estructura Modular](#-barra-de-navegación-de-5-pestañas-y-estructura-modular)
9. [Búsqueda, Ordenamiento y Desvinculación con Doble Confirmación](#-búsqueda-ordenamiento-y-desvinculación-con-doble-confirmación)
10. [Isotipos Institucionales y Optimización de Rendimiento](#-isotipos-institucionales-y-optimización-de-rendimiento)
11. [Dashboards Especializados para Menor y Adulto Protegido](#-dashboards-especializados-para-menor-y-adulto-protegido)
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
│ - Crear Cuenta (+18) / Login    │    │ - Código 6 Dígitos / QR  │
│ - Opción Google / Términos      │    │   (Sin campos duplicados)│
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
│   Sitios, Actividad, Cuenta con #E5F1FF)                         │
│ - Paso 5B: Dispositivo Protegido (Menor / Adulto)               │
└──────────────────────────────────────────────────────────────────┘
```

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

### 2. Jerarquía Tipográfica (Roboto)
- **Header / Título:** Roboto Bold `24px` (Line height `32px`).
- **Subtítulo:** Roboto Medium `18px` (Line height `24px`).
- **Cuerpo de Texto:** Roboto Regular `14px` (Line height `20px`).
- **Caption / Microcopy:** Roboto Regular `12px` (Line height `16px`).

---

## 🚪 Rediseño de Selección de Modo (Paso 2)

La pantalla de Selección de Modo (`WelcomeScreen.tsx` y `WelcomeStep.tsx`) fue optimizada para encajar al 100% en la pantalla de cualquier dispositivo móvil **sin necesidad de scroll**:

1. **Estructura en 2 Cuadros Principales:**
   - **Modo responsable:** Con ícono de **escudo** (`escudo.png`), descripción para gestión de reglas/restricciones, badge de seguridad *"Basado en PIN y contraseña."* y botón *"Empezar"*.
   - **Modo protegido:** Con ícono de **corazón** (`corazon.png`), descripción para dispositivos protegidos por adultos responsables, badge *"Basado en supervisión externa."* y botón *"Empezar"*.
2. **Armonía y Escala Unificada:**
   - Logotipo oficial completo (`size="md"`), título (*"Elegí cómo vas a usar la app"*) y subtítulo (*"Seleccioná el modo que más se adecúa a tus necesidades."*) escalados exactamente con las mismas dimensiones y posición superior que la pantalla de Onboarding.
3. **Botón de Ayuda Integrado (`?`):**
   - Botón circular azul alineado a la derecha debajo del cuadro de Modo protegido que redirige directamente al **Paso 3 del Wizard (Video Tutorial)**.

---

## 🔐 Arquitectura de Autenticación, Google Auth y Términos Legales

El módulo de autenticación está estructurado en una **arquitectura limpia y modular (`src/components/auth/`)**:

### 1. Componentes Modulares
- **`LoginScreen.tsx`:** Orquestador liviano responsable del contenedor y conmutación de vistas.
- **`RegisterForm.tsx`:** Formulario completo de creación de cuenta (+18, Google Auth y modales legales).
- **`LoginForm.tsx`:** Formulario de inicio de sesión con botón Google Auth e ingreso rápido de demo.
- **`RecoveryForm.tsx`:** Formulario de recuperación de contraseña con alertas de estado.

### 2. Funcionalidades y Validaciones de Seguridad
- **Ingreso con Google Integrado:** Botón oficial con el ícono [`logo_google.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/logo/logo_google.png) y divisor `"o"`.
- **Navegación Fluida con Tecla Enter (`returnKeyType="next"`):** Salto automático al siguiente campo al presionar Enter.
- **Destacado de Borde al Enfocar (`inputFocusedBorder`):** Borde activo azul (`borderColor: '#007AFF'`) al seleccionar cualquier entrada de texto.
- **Verificación Obligatoria de Mayoría de Edad (+18):** Al seleccionar o ingresar la fecha de nacimiento, el sistema calcula la edad exacta. Si es menor de 18 años, muestra inmediatamente una alerta nativa:
  > *"Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado."*
- **Aceptación Obligatoria de Términos y Políticas de Privacidad:** Checkbox interactivo antes del botón de creación de cuenta (`Acepto Términos y condiciones y Políticas de privacidad`).
- **Modales Legales Desplegables:** Ventanas modales flotantes para lectura de los **Términos y Condiciones** (marco regulatorio LOTBA S.E.) y las **Políticas de Privacidad** (Ley N° 25.326).
- **Selector de Calendario Interactivo con Ícono `📅`:** Modal deslizable con cómputo de días reales por mes y año.

---

## 📍 Configuración de Permisos y Geolocalización Híbrida (Paso 4)

La pantalla de solicitud y auditoría de permisos (`PermissionsScreen.tsx`) organiza **5 permisos esenciales de Android** en secciones desplegables:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 🌐 Servicio de Filtrado VPN (VpnService)                            │
│ 2. 🔒 Servicio de Accesibilidad (Antidesinstalación con PIN)           │
│ 3. 🔔 Notificaciones del Sistema (Alertas en tiempo real)              │
│ 4. 🔋 Sin Optimización de Batería (Ejecución continua en segundo plano)│
│ 5. 📍 Ubicación y Geolocalización (GPS / Red IP)                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Estrategia Híbrida de Geolocalización
1. **Captura por GPS Satelital (Alta Precisión):** Solicitud de coordenadas `(latitud, longitud)` y **Geocodificación Inversa** con OpenStreetMap (Nominatim).
2. **Fallback Automático por Red IP (Silencioso):** Consulta automática por IP pública (`ipapi.co`) si el sensor GPS no está disponible.
3. **Persistencia y Sincronización Backend:** Guardado local (`@ba_protege_user_location`) y envío mediante `POST /api/auth/location`.

---

## 📱 Vinculación Dual por Código de 6 Dígitos y Escaneo QR

La pantalla de pareamiento (`PairingScreen.tsx` y `PairingStep.tsx`) ofrece un flujo guiado y simplificado:

1. **`🔢 Código de 6 Dígitos`**:
   - 6 casillas visuales independientes con resalte dinámico de foco y borde azul.
2. **`📷 Escanear QR Code`**:
   - Escáner interactivo con solicitud de permisos de cámara de Android (`CAMERA`) y prueba simulada.
3. **Optimización del Formulario**:
   - Eliminación de campos duplicados (*"Nombre del dispositivo"* y *"Nombre del protegido"*), ya que son configurados por el tutor en el panel.

---

## 🧭 Barra de Navegación de 5 Pestañas y Estructura Modular

El **Panel del Responsable (`ParentDashboardScreen.tsx`)** se organiza a través de una barra de navegación inferior (`DashboardNavbar.tsx`) con **5 pestañas principales**:

```text
┌──────────────┬──────────────────┬──────────────┬──────────────┬──────────────┐
│  📊 Panel    │  📱 Dispositivos │  🌐 Sitios   │ 🔔 Actividad │  👤 Cuenta   │
└──────────────┴──────────────────┴──────────────┴──────────────┴──────────────┘
```

- **Resalte Visual Activo:** Contenedor redondeado `#E5F1FF` con texto en azul `#0056B3` e íconos PNG en la parte superior.
- **Ícono de Retorno (`volver.png`):** Integrado en el componente `Header.tsx` para todas las vistas secundarias.
- **Estructura por Carpetas Modular:**
  - `src/components/dashboard/dispositivos/`: `ProtectedDevicesSection.tsx`, `PairingSection.tsx`
  - `src/components/dashboard/sitios/`: `CustomSitesSection.tsx`, `GlobalRulesSection.tsx`
  - `src/components/dashboard/actividad/`: `ActivitySection.tsx`
  - `src/components/dashboard/cuenta/`: `SelfControlSection.tsx`, `TutorPermissionsSection.tsx`
  - `src/components/dashboard/SeccionDesplegable.tsx`: Contenedor desplegable reutilizable.

---

## 🔍 Búsqueda, Ordenamiento y Desvinculación con Doble Confirmación

En la sección de **Dispositivos Protegidos (`ProtectedDevicesSection.tsx`)**:

1. **Buscador Dinámico:**
   - Campo de entrada `🔍 Buscar por dispositivo o protegido...` con contador en tiempo real.
2. **Selector de Ordenamiento:**
   - Filtros de un solo clic para ordenar por **Nombre** (`🔤 Nombre`) o **Fecha de vinculación** (`📅 Fecha vinculación`).
3. **Desvinculación con Doble Confirmación (`Dupla Confirmação`):**
   - **Paso 1:** Advertencia sobre la desactivación del filtrado LOTBA en el dispositivo.
   - **Paso 2:** Confirmación final con eliminación permanente (`apiService.unbindDevice`).

---

## 🎨 Isotipos Institucionales y Optimización de Rendimiento

1. **Gestión Unificada de Logotipos:**
   - **Ícono de Instalación del App (Launcher):** Utiliza [`logo_ba.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/logo/logo_ba.png) en alta resolución configurado como ícono adaptativo API 26+ sobre fondo blanco `#FFFFFF` en todos los directorios `mipmap` de Android.
   - **Header del Dashboard:** Muestra `logo_ba.png` en la esquina superior derecha (`useBaLogo={true}`).
   - **Demás Pantallas:** Mantienen [`logo_baprotege.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/logo/logo_baprotege.png) a través del componente `Logo.tsx`.
2. **Arranque Instantáneo (< 100ms):**
   - **Caché en RAM (`safeStorage`):** Lecturas de tokens e identificadores desde memoria `Map` (**0ms**).
   - **Timeouts Optimizados:** Verificación de salud en **400ms** y peticiones HTTP en **1.000ms**, evitando congelamientos por fallas de red.

---

## 🛡️ Dashboards Especializados para Menor y Adulto Protegido

El dispositivo protegido (`ProtectedDeviceScreen.tsx` y `ProtectedDeviceStep.tsx`) ofrece una experiencia adaptada:

### 1. Dashboard del Menor Protegido (`CHILD`)
- **Enfoque**: Seguridad digital infantil y concientización sobre el juego de azar.
- **Sección Educativa**: Consejos de privacidad y línea de ayuda gratuita `0800-444-5682`.

### 2. Dashboard del Adulto Protegido (`ADULT`)
- **Enfoque**: Prevención de ludopatía, contención emocional y autoprotección.
- **Sección de Asistencia**: Botón de llamada directa a la *Línea de Asistencia al Jugador Compulsivo (0800-444-5682)* 24/7.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin, Mipmaps)
├── src/
│   ├── assets/                               # Recursos gráficos oficiales
│   │   ├── icons/                            # Íconos PNG (navbar, volver, ojo, etc.)
│   │   └── logo/                             # Isotipos oficiales (logo_ba.png, logo_baprotege.png, logo_google.png)
│   ├── components/                           # Componentes del Kit UI/UX
│   │   ├── auth/                             # Módulo de Autenticación Modular
│   │   │   ├── LoginForm.tsx                 # Formulario de Inicio de Sesión (Google Auth)
│   │   │   ├── RecoveryForm.tsx              # Formulario de Recuperación
│   │   │   └── RegisterForm.tsx              # Formulario (+18, Google Auth, Términos y Calendario)
│   │   ├── dashboard/                        # Módulo Modular del Dashboard
│   │   │   ├── actividad/                    # Sección de Registro de Actividad
│   │   │   ├── cuenta/                       # Autocontrol de 24h y Permisos del Tutor
│   │   │   ├── dispositivos/                 # Auditoría, Buscador, Orden, Doble Confirmación y Pairing
│   │   │   ├── sitios/                       # Reglas Globales y CRUD de Sitios Personalizados
│   │   │   ├── DashboardNavbar.tsx           # Navbar 5 Pestañas con Resalte #E5F1FF
│   │   │   ├── SeccionDesplegable.tsx        # Contenedor Desplegable con Badges
│   │   │   └── index.ts                      # Barrel Export de Módulo
│   │   ├── ActionButton.tsx                  # Botón con variantes
│   │   ├── Badge.tsx                         # Etiquetas de estado
│   │   ├── Header.tsx                        # Encabezado con ícono Volver y logo_ba.png
│   │   └── Logo.tsx                          # Logotipo oficial (logo_baprotege.png)
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Orquestador liviano de Autenticación
│   │   ├── OnboardingScreen.tsx              # Onboarding con video tutorial oficial
│   │   ├── PairingScreen.tsx                 # Pareamiento por 6 dígitos o QR
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable modularizado
│   │   ├── PermissionsScreen.tsx            # Solicitud de 5 permisos con GPS e IP
│   │   └── ProtectedDeviceScreen.tsx         # Panel del protegido (Menor / Adulto)
│   ├── services/                             # Lógica de comunicación y puentes
│   │   ├── api.service.ts                    # API Client, RAM Cache (0ms), Server Time, Autocontrol y Unbind
│   │   └── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   ├── theme/                                # Tokens de diseño e interfaz del Kit UI/UX
│   ├── web/                                  # Simulador Web Interactivo (Vite 8 + React 18)
│   │   ├── components/                       # Componentes espejo para simulación Web
│   │   └── WebSimulator.tsx                  # Orquestador del Simulador Web
├── tests/                                    # Pruebas unitarias automatizadas (45 tests / 10 suites)
│   ├── ageValidation.test.ts                 # Tests de Mayoría de Edad (+18)
│   ├── customBlocklist.test.ts               # Tests de CRUD de Sitios Personalizados
│   ├── dashboardNavbarAndPairing.test.ts     # Tests de Navbar 5 Opciones y Pairing Validation
│   ├── onboarding.test.ts                    # Tests de Onboarding
│   ├── permissions.test.ts                   # Tests de Permisos y Auditoría
│   ├── selfControl.test.ts                   # Tests de Autocontrol 24h y 5 Dispositivos
│   ├── theme.test.ts                         # Tests del Sistema de Diseño
│   ├── types.test.ts                         # Tests de tipos TypeScript
│   └── uikit.test.ts                         # Tests de tokens del UI Kit
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

### 3. Ejecutar la Suite Completa de Tests Automatizados (45 tests / 10 suites)
```bash
npm test
```

### 4. Iniciar el Simulador Web
```bash
npm run dev
```

### 5. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**
