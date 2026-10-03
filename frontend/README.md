# BA Protege+ — Frontend Mobile & Simulador Web

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile
Archivo: frontend/README.md
Descripción: Documentación técnica, guía de instalación, Kit UI/UX, Flujo de 5 Pasos,
             Solicitud y Alerta de Permisos Faltantes, Autocontrol con 24h lock y Límite de 5 Dispositivos.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Solicitud de Permisos del Dispositivo** (VPN, Accesibilidad, Notificaciones, Batería) con alertas de permisos pendientes, **Autocontrol del Responsable con bloqueo de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService` y un **Simulador Web Interactivo con Vite**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de 5 Pasos](#-flujo-ordenado-de-5-pasos)
3. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
4. [Nuevas Funcionalidades: Permisos, Autocontrol y 5 Dispositivos](#-nuevas-funcionalidades-permisos-autocontrol-y-5-dispositivos)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Guía de Instalación y Pruebas Web (Rápida)](#-guía-de-instalación-y-pruebas-web-rápida)
7. [Módulos Nativos Android en Kotlin](#-módulos-nativos-android-en-kotlin)
8. [Ejecución Nativa en Android Studio / Emulador](#-ejecución-nativa-en-android-studio--emulador)
9. [Funcionalidades y Escenarios de Prueba](#-funcionalidades-y-escenarios-de-prueba)

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
- **Cliente HTTP:** Axios con interceptores JWT para comunicación con el backend (`http://localhost:3000/api`)

---

## 🔄 Flujo Ordenado de 5 Pasos

La aplicación se navega a través de un flujo estructurado de 5 fases principales (`App.tsx` y `WebSimulator.tsx`):

```text
┌──────────────────────────────────────────────────────────────────┐
│ PASO 1: ONBOARDING Y TUTORIALES EN VIDEO PARA TODOS              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASO 2: SELECCIÓN DE MODO OPERATIVO (Responsable vs. Protegido) │
└────────────────┬────────────────────────────────┬────────────────┘
                 │                                │
                 ▼                                ▼
┌─────────────────────────────────┐    ┌──────────────────────────┐
│ PASO 3A: MODO RESPONSABLE       │    │ PASO 3B: MODO PROTEGIDO  │
│ - Login / Registro / Recovery   │    │ - Pareamiento con Código │
└────────────────┬────────────────┘    └────────────┬─────────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASO 4: PANTALLA DE PERMISOS DE ANDROID (Post-Login / Pairing)   │
│ - Configuración y explicación de los 4 permisos esenciales       │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────┴─────────────────────────────────┐
│ PASO 5: PANTALLA PRINCIPAL DE DESTINO                            │
│ - Paso 5A: Dashboard del Responsable (Hasta 5 dispositivos & 24h)│
│ - Paso 5B: Dispositivo Protegido (Con Alerta de Permisos Pend.)  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Sistema de Diseño y Kit UI/UX

El proyecto cuenta con un **Kit UI/UX estandarizado** basado en las especificaciones oficiales de la carpeta `frontend/ui/` (`uikit.txt` y recursos vectoriales SVG/PNG):

### 1. Tokens de Color Oficiales
- **Primary (`#007AFF`):** Botones principales, encabezados, selección de modo y elementos activos.
- **Secondary (`#28A745`):** Estado de protección activa, confirmaciones y operaciones exitosas.
- **Text Primary (`#1C1C1E`):** Títulos, encabezados y texto principal sobre fondo claro.
- **Text Secondary (`#8E8E93`):** Subtítulos, textos secundarios, bordes e íconos deshabilitados.
- **Background (`#F8F9FA`):** Fondo general de las pantallas y contenedores de tarjetas (cards).
- **Feedback / Error (`#DC3545`):** Sitios bloqueados, alertas críticas y desinstalación.
- **Feedback / Warning (`#FFC107`):** Advertencias de vinculación, avisos pendientes y alertas.

### 2. Jerarquía Tipográfica (Roboto)
- **Header / Título:** Roboto Bold `24px` (Line height `32px`).
- **Subtítulo:** Roboto Medium `18px` (Line height `24px`).
- **Cuerpo de Texto:** Roboto Regular `14px` (Line height `20px`).
- **Caption / Microcopy:** Roboto Regular `12px` (Line height `16px`).

---

## 🛡️ Nuevas Funcionalidades: Permisos, Autocontrol y 5 Dispositivos

1. **Pantalla de Solicitud de Permisos (`PermissionsScreen.tsx`):**
   - Configuración pedagógica de los 4 permisos del sistema Android:
     1. `Servicio VPN Local (VpnService)`: Filtro de paquetes DNS para dominios LOTBA.
     2. `Servicio de Accesibilidad`: Protección antidesinstalación sin PIN del tutor.
     3. `Notificaciones en Primer Plano`: Canal persistente de estado y alertas.
     4. `Sin Optimización de Batería`: Ejecución continua con pantalla apagada.
2. **Caja de Alerta de Permisos Faltantes:**
   - Si el usuario o tutor continúa a la pantalla principal sin otorgar los 4 permisos, se despliega una tarjeta amarilla de advertencia **`⚠️ Permisos Pendientes (X/4 Concedidos)`** detallando exactamente qué permisos faltan (ej. `• Notificaciones en Primer Plano`) con botón directo para configurarlos.
3. **Auditoría de Permisos de Dispositivos Protegidos:**
   - En el **Panel del Responsable (`ParentDashboardScreen.tsx`)**, cada tarjeta de dispositivo vinculado muestra la etiqueta de permisos `PERMISOS: 4/4 CONCEDIDOS` y permite desplegar el desglose individual por celular.
4. **Límite de hasta 5 Dispositivos por Responsable (`MAX_PARENT_DEVICES = 5`):**
   - Límite de vinculación de hasta 5 celulares por cuenta de responsable.
5. **Autocontrol del Responsable con Bloqueo de 24 Horas:**
   - Autoprotección con **Doble Confirmación** y bloqueo inflexible durante 24 horas continuas con cuenta regresiva en vivo en formato corregido `24h 00m`.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin)
├── src/
│   ├── components/                           # Componentes del Kit UI/UX
│   │   ├── ActionButton.tsx                  # Botón con estados de carga y variantes
│   │   ├── Badge.tsx                         # Etiquetas de estado (Activo, Inactivo, Alerta)
│   │   ├── ControlCard.tsx                   # Tarjetas interactivas para reglas de control
│   │   ├── Header.tsx                        # Encabezado institucional con jerarquía tipográfica
│   │   ├── Logo.tsx                          # Logotipo genérico oficial con isotipo
│   │   ├── PinKeyboard.tsx                   # Teclado numérico interactivo 3x4 para PIN
│   │   ├── StatusCard.tsx                    # Tarjeta de estado efectivo con Badges
│   │   └── ToggleSwitch.tsx                  # Switch interactivo OFF/ON
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Autenticación, Registro y Recuperación de contraseña
│   │   ├── OnboardingScreen.tsx              # Onboarding con carrusel de 3 videos tutoriales
│   │   ├── PairingScreen.tsx                 # Pareamiento por código de 6 dígitos
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable con Alertas de Permisos del Tutor
│   │   ├── PermissionsScreen.tsx            # Solicitud y explicación de los 4 permisos del sistema
│   │   ├── ProtectedDeviceScreen.tsx         # Panel del protegido con Alerta de Permisos Faltantes
│   │   └── WelcomeScreen.tsx                 # Selección de modo de operación
│   ├── services/                             # Lógica de comunicación y puentes
│   │   ├── api.service.ts                    # API Client, Server Time NTP y Autocontrol 24h
│   │   └── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   ├── theme/                                # Tokens de diseño e interfaz del Kit UI/UX
│   │   ├── colors.ts                         # Tokens de color oficiales (uikit.txt)
│   │   ├── typography.ts                     # Escala y jerarquía tipográfica (Roboto)
│   │   └── index.ts                          # Exportación central del tema
│   ├── types/                                # Definiciones TypeScript (DevicePermissionsStatus, DeviceInfo)
├── tests/                                    # Pruebas unitarias
│   ├── onboarding.test.ts                    # Tests de Onboarding
│   ├── permissions.test.ts                   # Tests de Permisos y Auditoría
│   ├── selfControl.test.ts                   # Tests de Autocontrol 24h y Límite de 5 Dispositivos
│   ├── theme.test.ts                         # Tests del Sistema de Diseño
│   ├── types.test.ts                         # Tests de tipos TypeScript
│   └── uikit.test.ts                         # Tests de tokens del UI Kit
```

---

## ⚡ Guía de Instalación y Pruebas Web (Rápida)

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Ejecutar los Tests Automatizados
```bash
npm test
```

### 3. Iniciar el Simulador Web
```bash
npm run dev
```

### 4. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**

---

## 🧪 Funcionalidades y Escenarios de Prueba

### 1. Flujo Ordenado de 5 Pasos en el Simulador Web:
- **Paso 1:** Onboarding interactivo con reproductor de video simulado.
- **Paso 2:** Selección de modo de operación (*Responsable vs. Dispositivo Protegido*).
- **Paso 3:**
  - **3A:** Iniciar sesión, recuperar contraseña o crear cuenta responsable.
  - **3B:** Ingresar el código de pareamiento de 6 dígitos del menor.
- **Paso 4:** Conceder o probar interactivamente los 4 permisos del sistema (VPN, Accesibilidad, Notificaciones, Batería).
- **Paso 5:**
  - **5A (Dashboard):** Visualizar tarjetas con la alerta de permisos pendientes del tutor, límite de 5 dispositivos y autocontrol de 24hs.
  - **5B (Protegido):** Visualizar la caja amarilla de advertencia informando sobre los permisos pendientes de autorizar.
