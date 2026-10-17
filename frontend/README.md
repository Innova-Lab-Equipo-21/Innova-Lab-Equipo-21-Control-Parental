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
             Desvinculación con Doble Confirmación y Suite de 45 Tests.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)** con **Modales Bottom Sheet Legales (`TermsModal` / `PrivacyModal`)** y selector de fecha (`DatePickerModal`), **Ingreso con Google e ícono oficial (`logo_google.png`)**, **Rediseño Completo de Permisos de Aplicación (`PermissionsScreen.tsx`)** con cabecera `#EAF3FF`, banner estilo *Card 1*, acordeón de 5 permisos y retorno deslogueado a `LoginForm`, **Estandarización del ícono `volver.png` en color negro**, **Navegación de 5 Pestañas con Resalte `#E5F1FF` y Nombres (`DashboardNavbar.tsx`)**, **Estructura Modular por Carpetas (`src/components/dashboard/`)**, **Búsqueda, Ordenamiento y Desvinculación de Dispositivos con Doble Confirmación**, **Optimización de Rendimiento con Caché en RAM (0ms)**, **Íconos e Isotipos Unificados (`logo_ba.png` / `logo_baprotege.png`)**, **Dashboards Especializados para Menor Protegido y Adulto en Tratamiento**, **Autocontrol del Tutor con bloqueo de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService` y un **Simulador Web Interactivo con Vite**.

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

## 🔐 Arquitectura de Autenticación, Google Auth y Modales Bottom Sheet

El módulo de autenticación está estructurado en una **arquitectura desacoplada, modular y reutilizable (`src/components/auth/`)**:

### 1. Componentes Modulares
- **`LoginScreen.tsx`:** Orquestador liviano responsable del contenedor, scroll y conmutación reactiva de vistas (`LOGIN`, `REGISTER`, `RECOVERY`).
- **`RegisterForm.tsx`:** Formulario completo de creación de cuenta (+18, Google Auth, selector de fecha y modales legales).
- **`LoginForm.tsx`:** Formulario de inicio de sesión con botón Google Auth, modales legales Bottom Sheet e ingreso rápido de demo.
- **`RecoveryForm.tsx`:** Formulario de recuperación de contraseña con diseño dual de botones de Onboarding (*"Volver"* secundario con borde azul + *"Recuperar contraseña"* primario con indicador de carga).
- **`TermsModal.tsx` & `PrivacyModal.tsx`:** Modales **Bottom Sheet** reutilizables con tirador de arrastre superior, esquinas redondeadas (`borderTopRadius: 24`), descarte al tocar el fondo (`backdrop`) y scroll independiente (`maxHeight: '82%'`). Compartidos entre el registro y el login.
- **`DatePickerModal.tsx`:** Modal de calendario encapsulado con cómputo automático de días por mes y año, validación de bisiestos y selección ágil.
- **`LegalModal.styles.ts` & `RegisterForm.styles.ts`:** Hojas de estilos modulares con cabecera estándar comentada (`// Proyecto: BA Protege+...`).

### 2. Funcionalidades y Validaciones de Seguridad
- **Ingreso con Google Optimizado:** Botón oficial con el logotipo de alta resolución [`logo_google.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/logo/logo_google.png) redimensionado proporcionalmente (`width: 200, height: 44, resizeMode="contain"`) y divisor sutil `"o"`.
- **Navegación Fluida con Tecla Enter (`returnKeyType="next"`):** Salto automático al siguiente campo al presionar Enter.
- **Destacado de Borde al Enfocar (`inputFocusedBorder`):** Borde activo azul (`borderColor: '#007AFF'`) al seleccionar cualquier entrada de texto.
- **Verificación Obligatoria de Mayoría de Edad (+18):** Al seleccionar o ingresar la fecha de nacimiento, el sistema calcula la edad exacta. Si es menor de 18 años, muestra inmediatamente una alerta nativa:
  > *"Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado."*
- **Aceptación Obligatoria de Términos y Políticas de Privacidad:** Checkbox interactivo antes del botón de creación de cuenta (`Acepto Términos y condiciones y Políticas de privacidad`).
- **Estilo Dual de Botones en Recuperación:** Aplicado el mismo patrón visual de Onboarding en `RecoveryForm.tsx` (botón de retorno blanco con borde azul `#007AFF` a la izquierda y acción principal en azul sólido a la derecha).

---

## 📍 Rediseño de Permisos de Aplicación y Geolocalización Híbrida (Paso 4)

La pantalla de solicitud y auditoría de permisos (`PermissionsScreen.tsx`) fue completamente rediseñada bajo el nuevo modelo visual institucional con **desacoplamiento de estilos (`PermissionsScreen.styles.ts`)**:

### 1. Elementos Visuales y de Navegación
- **Cabecera Institucional Superior (`#EAF3FF`):** Barra superior con fondo celeste institucional `#EAF3FF` y el logotipo [`logo_baprotege_texto.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/logo/logo_baprotege_texto.png).
- **Subheader con Retorno y Deslogueo a Login:**
  - Ícono [`volver.png`](file:///C:/Projetos/baprotege+/frontend/src/assets/icons/volver.png) en color negro (`#000000`) a la izquierda.
  - Título *"Permisos de Aplicación"* estilizado idénticamente al título principal de registro (`fontSize: 22`, `fontWeight: '800'`, `color: '#000000'`, `lineHeight: 28`, `letterSpacing: -0.3`).
  - **Flujo de Cierre de Sesión:** Al presionar el botón de retorno, el usuario es deslogueado de forma segura y redirigido directamente al formulario de inicio de sesión (`LoginForm.tsx`) mediante `loginInitialViewMode = 'LOGIN'` en `App.tsx`.
- **Banner Informativo Estilo CARD 1 (Modo Responsable):**
  - Marco azul con fondo `#F0F7FF`, borde de `2px` en `#007AFF`, radio de curvatura de `18px` y sombra azul suave.
  - Ícono oficial de escudo (`Icon name="escudo"`), título en azul *"Configurá tu dispositivo"* (`fontSize: 18`, `fontWeight: '700'`) y texto descriptivo en color `#1C1C1E` para lectura nítida.
- **Estandarización Global del Ícono `volver.png`:**
  - Configurado en color negro (`#000000`) en toda la aplicación (`Icon.tsx`, `Header.tsx`, `WelcomeScreen.tsx`, `RegisterForm.tsx` y el simulador web).

### 2. Estructura de Acordeón de 5 Permisos Esenciales
Cada permiso cuenta con una tarjeta independiente con indicador tipo *pill* (`Inactivo` / `Activo`), ícono chevron azul (`∧` / `∨`), línea divisoria y botón de autorización:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 🌐 Servicio de Filtrado VPN (Inactivo / Activo)                     │
│    Intercepta y bloquea sitios clandestinos de la lista oficial LOTBA │
├────────────────────────────────────────────────────────────────────────┤
│ 2. 🔒 Servicio de Accesibilidad (Inactivo / Activo)                    │
│    Protección antidesinstalación con requerimiento de PIN del tutor    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 🔔 Notificaciones del Sistema (Activo / Inactivo)                   │
│    Mantiene el servicio persistente y avisos de intentos de bloqueo    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. 🔋 Optimización de Batería (Desplegado por defecto)                 │
│    Evita que el ahorro de energía de Android suspenda el filtrado      │
├────────────────────────────────────────────────────────────────────────┤
│ 5. 📍 Ubicación y Geolocalización (GPS / Red IP)                       │
│    Guarda la posición geográfica del dispositivo para el responsable   │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Estrategia Híbrida de Geolocalización
1. **Captura por GPS Satelital (Alta Precisión):** Solicitud de coordenadas `(latitud, longitud)` y **Geocodificación Inversa** con OpenStreetMap (Nominatim), visualizando la dirección exacta en una caja de ubicación destacada.
2. **Fallback Automático por Red IP (Silencioso):** Consulta automática por IP pública (`ipapi.co`) si el sensor GPS no está disponible o es denegado.
3. **Persistencia y Sincronización Backend:** Guardado local (`@ba_protege_user_location`) y envío automático mediante `POST /api/auth/location`.

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

## ✨ Actualizaciones Recientes y Nuevos Módulos

1. **Panel de Acción Inicial del Responsable (`ResponsibleActionScreen.tsx`)**:
   - Mostrada tras completar los permisos de aplicación, permitiendo al tutor elegir entre *Supervisar otro dispositivo* o *Ejercer un autocontrol*.
   - Incluye **Modal de Ayuda (`ResponsibleHelpModal.tsx`)** bajo el diseño institucional Bottom Sheet (estilo `TermsModal`).
2. **Unificación de Cabecera Institucional (`Header.tsx`)**:
   - Todas las pantallas con usuario logueado comparten la barra superior `#EAF3FF` con el logotipo oficial `logo_baprotege_texto.png` y subcabecera unificada.
3. **Formulario de Vinculación Inteligente (`PairingSection.tsx`)**:
   - Selección de **Fecha de Nacimiento** reubicada arriba de Tipo con calendario integrado dentro del textfield (estilo `RegisterForm`).
   - Determinación automática del **Tipo (Menor / Adulto)** basada en la edad calculada a partir de la fecha de nacimiento.
   - Códigos de vinculación **sin expiración (100 años)** que se actualizan automáticamente al regenerar, previniendo duplicados con validación de pedidos pendientes.
4. **Refactorización Modular de Estilos (`.styles.ts`)**:
   - Separación completa de objetos `StyleSheet.create` en archivos `.styles.ts` independientes para `WelcomeScreen`, `ResponsibleActionScreen`, `ParentDashboardScreen`, `PairingSection` y `GlobalRulesSection`.

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
│   │   │   ├── DatePickerModal.tsx           # Modal interactivo de selección de fecha/calendario
│   │   │   ├── LegalModal.styles.ts          # Estilos de Bottom Sheet para modales legales
│   │   │   ├── LoginForm.tsx                 # Formulario de Inicio de Sesión (Google Auth)
│   │   │   ├── LoginForm.styles.ts           # Estilos desacoplados de LoginForm
│   │   │   ├── PrivacyModal.tsx              # Modal Bottom Sheet de Políticas de Privacidad
│   │   │   ├── RecoveryForm.tsx              # Formulario con diseño dual de botones de Onboarding
│   │   │   ├── RecoveryForm.styles.ts        # Estilos desacoplados de RecoveryForm
│   │   │   ├── RegisterForm.tsx              # Formulario (+18, Google Auth, Términos y Calendario)
│   │   │   ├── RegisterForm.styles.ts        # Estilos desacoplados de RegisterForm
│   │   │   └── TermsModal.tsx                # Modal Bottom Sheet de Términos y Condiciones
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
│   │   ├── Header.tsx                        # Encabezado con ícono Volver negro y logo_ba.png
│   │   ├── Icon.tsx                          # Componente unificado de íconos PNG
│   │   └── Logo.tsx                          # Logotipo oficial (logo_baprotege.png)
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Orquestador liviano de Autenticación
│   │   ├── OnboardingScreen.tsx              # Onboarding con video tutorial oficial
│   │   ├── PairingScreen.tsx                 # Pareamiento por 6 dígitos o QR
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable modularizado
│   │   ├── PermissionsScreen.tsx            # Pantalla de 5 permisos con acordeón y GPS
│   │   ├── PermissionsScreen.styles.ts       # Estilos desacoplados de la pantalla de permisos
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
