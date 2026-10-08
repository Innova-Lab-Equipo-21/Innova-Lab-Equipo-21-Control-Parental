# BA Protege+ — Frontend Mobile & Simulador Web

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile
Archivo: frontend/README.md
Descripción: Documentación técnica, guía de instalación, Kit UI/UX, Flujo de 5 Pasos,
             Módulo de Autenticación Refactorizado, Vinculación por Código y QR,
             Panel del Responsable con Acordeones, Dashboards para Menor y Adulto.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de 5 Pasos**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)**, **Verificación de Mayoría de Edad (+18)**, **Vinculación Dual por Código de 6 Dígitos o Escaneo de QR**, **Panel del Responsable Modular con Acordeones Desplegables (`src/components/dashboard/`)**, **Dashboards Especializados para Menor Protegido y Adulto en Tratamiento**, **Autocontrol del Responsable con bloqueo de 24hs**, gestión de **hasta 5 dispositivos por responsable**, módulos nativos en **Kotlin 2.x** para filtrado local `VpnService` y un **Simulador Web Interactivo con Vite**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de 5 Pasos](#-flujo-ordenado-de-5-pasos)
3. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
4. [Rediseño de Selección de Modo (Paso 2)](#-rediseño-de-selección-de-modo-paso-2)
5. [Arquitectura de Autenticación, Registro (+18) y Términos Legales](#-arquitectura-de-autenticación-registro-18-y-términos-legales)
6. [Configuración de Permisos y Geolocalización Híbrida (Paso 4)](#-configuración-de-permisos-y-geolocalización-híbrida-paso-4)
7. [Vinculación Dual por Código y QR Code](#-vinculación-dual-por-código-y-qr-code)
8. [Panel del Responsable Modular con Acordeones](#-panel-del-responsable-modular-con-acordeones)
9. [Dashboards Especializados para Menor y Adulto Protegido](#-dashboards-especializados-para-menor-y-adulto-protegido)
10. [Estructura del Proyecto](#-estructura-del-proyecto)
11. [Guía de Instalación y Pruebas Rápida](#-guía-de-instalación-y-pruebas-rápida)

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
└────────────────┬────────────────┘    └────────────┬─────────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASO 4: PANTALLA DE PERMISOS DE ANDROID (Post-Login / Pairing)   │
│ - Configuración y explicación con Acordeones por permiso          │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────┴─────────────────────────────────┐
│ PASO 5: PANTALLA PRINCIPAL DE DESTINO                            │
│ - Paso 5A: Dashboard del Responsable Modular con Acordeones      │
│ - Paso 5B: Dispositivo Protegido (Diferenciado para Menor y Adulto)│
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Sistema de Diseño y Kit UI/UX

El proyecto cuenta con un **Kit UI/UX estandarizado** basado en las especificaciones oficiales de la carpeta `frontend/ui/` (`uikit.txt` e íconos oficiales PNG en `src/assets/icons/`):

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

## 🔐 Arquitectura de Autenticación, Registro (+18) y Términos Legales

El módulo de autenticación fue refactorizado pasando de un archivo monolítico a una **arquitectura limpia y modular (`src/components/auth/`)**:

### 1. Componentes Modulares
- **`LoginScreen.tsx`:** Orquestador liviano (~130 líneas) responsable del contenedor y conmutación de vistas.
- **`RegisterForm.tsx`:** Formulario completo de creación de cuenta que se despliega automáticamente al ingresar por primera vez al Modo Responsable.
- **`LoginForm.tsx`:** Formulario de inicio de sesión con botón de auto-rellenado de credenciales de demostración.
- **`RecoveryForm.tsx`:** Formulario de recuperación de contraseña con alertas de estado.

### 2. Funcionalidades y Validaciones de Seguridad
- **Navegación Fluida con Tecla Enter (`returnKeyType="next"`):** Al presionar Enter en el teclado, el foco salta automáticamente al siguiente campo (Nombre ➔ Apellido ➔ Fecha de Nacimiento ➔ Teléfono ➔ Correo ➔ Contraseña ➔ Confirmación).
- **Destacado de Borde al Enfocar (`inputFocusedBorder`):** Borde activo azul (`borderColor: '#007AFF'`, `borderWidth: 2`) al seleccionar cualquier entrada de texto.
- **Verificación Obligatoria de Mayoría de Edad (+18):** Al seleccionar o ingresar la fecha de nacimiento, el sistema calcula la edad exacta. Si es menor de 18 años, muestra inmediatamente una alerta nativa:
  > *"Solo personas adultas (+18) pueden registrarse en el Modo Responsable. Tu registro no podrá ser confirmado."*
- **Aceptación Obligatoria de Términos y Políticas de Privacidad:** Checkbox interactivo en el formulario posicionado directamente antes del botón de creación de cuenta (`Acepto Términos y condiciones y Políticas de privacidad`). Bloquea la confirmación del registro hasta ser activado.
- **Modales Legales Desplegables:** Ventanas modales integradas para lectura de los **Términos y Condiciones** (marco regulatorio LOTBA S.E. para la prevención del juego ilegal en CABA) y las **Políticas de Privacidad** (Ley N° 25.326 de Protección de Datos Personales).
- **Selector de Calendario Interactivo:** Selector con cómputo automático de días reales por mes y año (evitando fechas inválidas como 30 de febrero).
- **Reglas de Campos:** Nombre y Apellido (mínimo 2 caracteres y solo letras), Teléfono (mínimo 10 dígitos), Correo (formato regex válido) y Confirmación de Contraseña coincidente.
- **Opción de Registro con Google:** Botón integrado *"Registrarse con Google"* / *"Continuar con Google"*.
- **Ícono Oficial de Visibilidad:** Conmutación de contraseñas con el ícono unificado `@src/assets/icons/ojo.png` (`<Icon name="ojo" ... />`).
- **Carrusel de Género Limpio:** Opciones horizontales sin emojis (`Masculino`, `Femenino`, `Otro`, `No informado`).

---

## 📍 Configuración de Permisos y Geolocalización Híbrida (Paso 4)

La pantalla de solicitud y auditoría de permisos (`PermissionsScreen.tsx`) fue ampliada a **5 permisos esenciales de Android** organizados en acordeones individuales:

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
1. **Captura por GPS Satelital (Alta Precisión):** Al presionar *"Autorizar Permiso de Ubicación (GPS)"*, la aplicación solicita coordenadas `(latitud, longitud)` al sensor del dispositivo y realiza **Geocodificación Inversa** con la API de OpenStreetMap (Nominatim) para obtener la calle, altura, barrio y ciudad exactos.
2. **Fallback Automático por Red IP (100% Silencioso):** Si el sensor GPS no está disponible o el usuario rechaza el permiso, el sistema consulta automáticamente la geolocalización por IP pública (`ipapi.co`), registrando la ciudad y provincia aproximadas.
3. **Persistencia y Sincronización Backend:** La ubicación obtenida se guarda localmente (`@ba_protege_user_location`) y se envía al backend a través de `apiService.saveUserLocation()` y el endpoint `POST /api/auth/location`.
4. **Auditoría Unificada (`5/5 CONCEDIDOS`):** Sincronización completa del estado de los 5 permisos en `TutorPermissionsSection.tsx`, `ProtectedDeviceScreen.tsx`, `PermissionsStep.tsx` y `WebSimulator.tsx`.

---

## 📱 Vinculación Dual por Código y QR Code

Para simplificar la conexión entre dispositivos, la pantalla de emparejamiento (`PairingScreen.tsx` y `PairingStep.tsx`) admite dos métodos flexibles:

1. **`🔢 Código de 6 Dígitos`**:
   - Ingreso numérico tradicional para ingresar los 6 dígitos generados por el tutor.
2. **`📷 Escanear QR Code`**:
   - Escáner interactivo con solicitud de permisos de cámara de Android (`CAMERA`), recadro de encuadre y botón de prueba simulada.
3. **Generación de QR en el Panel del Responsable**:
   - Al hacer clic en *"Generar Código y QR"*, el panel del tutor despliega el código numérico junto a la imagen oficial de un **Código QR dinámico** para ser escaneado por el teléfono del menor.

---

## 📂 Panel del Responsable Modular con Acordeones

Para eliminar el scroll excesivo y mejorar la organización visual, el **Panel del Responsable (`ParentDashboardScreen.tsx`)** fue refactorizado mediante subcomponentes modulares en `src/components/dashboard/` envueltos en secciones de **Acordeón Desplegable (`AccordionSection.tsx`)**:

1. **`TutorPermissionsSection.tsx`**: Auditoría de los 4 permisos del dispositivo del tutor.
2. **`PairingSection.tsx`**: Generador de código de 6 dígitos y muestra de Código QR oficial.
3. **`SelfControlSection.tsx`**: Autoprotección permanente con temporizador de espera de 24 horas y desbloqueo.
4. **`GlobalRulesSection.tsx`**: Reglas globales de filtrado LOTBA, alertas y protección antidesinstalación.
5. **`CustomSitesSection.tsx`**: Gestión CRUD de sitios web bloqueados personalizados con buscador y categorías.
6. **`ProtectedDevicesSection.tsx`**: Auditoría detallada de cumplimiento de permisos de hasta 5 dispositivos vinculados.

---

## 🛡️ Dashboards Especializados para Menor y Adulto Protegido

El dispositivo protegido (`ProtectedDeviceScreen.tsx` y `ProtectedDeviceStep.tsx`) ofrece una experiencia personalizada según la modalidad de usuario:

### 1. Dashboard del Menor Protegido (`CHILD`)
- **Enfoque**: Seguridad digital infantil y concientización sobre el juego de azar.
- **Sección Educativa**:
  - 🎮 *¿Por qué las apuestas están prohibidas para menores?*
  - 🛡️ *Consejos para cuidar tu privacidad en internet y redes sociales*.
  - 📞 *Línea Gratuita de Orientación y Ayuda 24hs (0800-444-5682)*.

### 2. Dashboard del Adulto Protegido (`ADULT`)
- **Enfoque**: Prevención de ludopatía, contención emocional y autoprotección.
- **Sección de Asistencia**:
  - 💜 *Línea de Asistencia al Jugador Compulsivo (0800-444-5682)* con botón de llamada directa 24/7.
  - 🧠 *Estrategias para el Manejo de Impulsos y Ansiedad*.
  - 🤝 *Red de Apoyo y Transparencia Afectiva*.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin)
├── src/
│   ├── assets/                               # Recursos gráficos oficiales
│   │   ├── icons/                            # Íconos PNG (ojo, escudo, corazon, candado, etc.)
│   │   └── logo/                             # Isotipos y logotipos institucionales
│   ├── components/                           # Componentes del Kit UI/UX
│   │   ├── auth/                             # Módulo de Autenticación Refactorizado
│   │   │   ├── LoginForm.tsx                 # Formulario de Inicio de Sesión
│   │   │   ├── RecoveryForm.tsx              # Formulario de Recuperación
│   │   │   └── RegisterForm.tsx              # Formulario de Registro (+18, Google, Focus, Términos Legales)
│   │   ├── dashboard/                        # Subcomponentes Modulares del Panel del Tutor
│   │   │   ├── AccordionSection.tsx          # Contenedor Desplegable con Badges
│   │   │   ├── CustomSitesSection.tsx        # CRUD de Sitios Personalizados con Buscador
│   │   │   ├── GlobalRulesSection.tsx        # Reglas Globales de Filtrado LOTBA
│   │   │   ├── PairingSection.tsx            # Generador de Código y Muestra de QR
│   │   │   ├── ProtectedDevicesSection.tsx   # Auditoría de Dispositivos Vinculados
│   │   │   ├── SelfControlSection.tsx        # Autocontrol de 24h con Temporizador
│   │   │   └── TutorPermissionsSection.tsx   # Auditoría de Permisos del Tutor (5/5 Concedidos)
│   │   ├── ActionButton.tsx                  # Botón con estados de carga y variantes
│   │   ├── Badge.tsx                         # Etiquetas de estado (Activo, Inactivo, Alerta)
│   │   ├── ControlCard.tsx                   # Tarjetas interactivas para reglas de control
│   │   ├── Header.tsx                        # Encabezado institucional con jerarquía tipográfica
│   │   ├── Icon.tsx                          # Componente unificado de íconos PNG
│   │   ├── Logo.tsx                          # Logotipo genérico oficial con isotipo
│   │   ├── PinKeyboard.tsx                   # Teclado numérico interactivo 3x4 para PIN
│   │   ├── StatusCard.tsx                    # Tarjeta de estado efectivo con Badges
│   │   └── ToggleSwitch.tsx                  # Switch interactivo OFF/ON
│   ├── data/                                 # Datos de tutoriales y video de onboarding
│   │   └── tutorialVideos.ts                 # Video tutorial oficial único (35 seg)
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Orquestador liviano de Autenticación
│   │   ├── OnboardingScreen.tsx              # Onboarding con video tutorial oficial
│   │   ├── PairingScreen.tsx                 # Pareamiento por código de 6 dígitos o QR
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable modularizado con Acordeones
│   │   ├── PermissionsScreen.tsx            # Solicitud de los 5 permisos con GPS e IP Híbrida
│   │   ├── ProtectedDeviceScreen.tsx         # Panel del protegido diferenciado (Menor / Adulto)
│   │   └── WelcomeScreen.tsx                 # Selección de modo compacta sin scroll
│   ├── services/                             # Lógica de comunicación y puentes
│   │   ├── api.service.ts                    # API Client, Server Time, Autocontrol 24h y Ubicación (GPS/IP)
│   │   └── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   ├── theme/                                # Tokens de diseño e interfaz del Kit UI/UX
│   │   ├── colors.ts                         # Tokens de color oficiales (uikit.txt)
│   │   ├── typography.ts                     # Escala y jerarquía tipográfica (Roboto)
│   │   └── index.ts                          # Exportación central del tema
│   ├── types/                                # Definiciones TypeScript (DevicePermissionsStatus, DeviceInfo)
│   └── utils/                                # Funciones de utilidad y validaciones
│       ├── age.ts                            # Cálculo y validación de mayoría de edad (+18)
│       └── authValidation.ts                 # Sanitización, reglas y validaciones de formularios
├── tests/                                    # Pruebas unitarias automatizadas (39 tests)
│   ├── ageValidation.test.ts                 # Tests de Mayoría de Edad (+18)
│   ├── customBlocklist.test.ts               # Tests de CRUD de Sitios Personalizados
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

### 3. Ejecutar los Tests Automatizados (39 tests)
```bash
npm test
```

### 4. Iniciar el Simulador Web
```bash
npm run dev
```

### 5. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**
