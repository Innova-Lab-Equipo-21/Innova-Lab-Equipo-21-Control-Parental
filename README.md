# BA Protege+ (Innova Lab Equipo 21 - Control Parental)

<!--
==============================================================================
Proyecto: BA Protege+
Descripción: Documentación general del proyecto de control parental para la
             protección de menores y autocontrol de adultos frente a plataformas
             de apuestas no autorizadas.
==============================================================================
-->

Sistema integral de control parental y protección digital desarrollado para salvaguardar a niños, niñas, adolescentes y adultos frente a plataformas de apuestas online y sitios de juegos no autorizados, integrando el **Kit UI/UX del Sistema de Diseño oficial**, la lista de la **LOTBA (Lotería de la Ciudad de Buenos Aires)**, **Auditoría de Permisos de Dispositivos Protegidos**, **Autocontrol del Responsable con bloqueo de 24 horas** y gestión de **hasta 5 dispositivos por responsable**.

---

## 📌 Tabla de Contenidos

1. [Visión General y Propuesta de Valor](#-visión-general-y-propuesta-de-valor)
2. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
3. [Nuevas Funcionalidades: Auditoría de Permisos, Autocontrol y Límite de Dispositivos](#-nuevas-funcionalidades-auditoría-de-permisos-autocontrol-y-límite-de-dispositivos)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Stack Tecnológico Oficial](#-stack-tecnológico-oficial)
6. [Estructura del Repositorio (Monorepo)](#-estructura-del-repositorio-monorepo)
7. [Requisitos Previos del Entorno](#-requisitos-previos-del-entorno)
8. [Guía de Instalación Paso a Paso](#-guía-de-instalación-paso-a-paso)
9. [Guía de Pruebas Rápidas (Modo Simulado / Sin Base de Datos)](#-guía-de-pruebas-rápidas-modo-simulado--sin-base-de-datos)
10. [Configuración con Base de Datos Real (PostgreSQL 18)](#-configuración-con-base-de-datos-real-postgresql-18)
11. [Ejecución en Emulador / Dispositivo Android](#-ejecución-en-emulador--dispositivo-android)

---

## 🎯 Visión General y Propuesta de Valor

El proyecto **BA Protege+** ofrece una solución de protección integral para familias y adultos:

1. **Modo Responsable (Padre / Madre / Tutor):**
   - Panel de control en tiempo real para la gestión de hasta **5 dispositivos por responsable**.
   - **Auditoría en Tiempo Real de Permisos de Dispositivos Protegidos:** El tutor puede desplegar la ficha de cada hijo y auditar el estado exacto de sus 4 permisos de Android (`Servicio VPN`, `Accesibilidad Antidesinstalación`, `Notificaciones` y `Exención de Batería`).
   - **Autocontrol del Tutor / Adulto:** Protección personal activable mediante **doble confirmación** (Paso 1 y Paso 2) con **bloqueo estricto de desactivación durante 24 horas**.
   - **Protección Anti-Manipulación de Hora:** Validación con tiempo de servidor/red (`getReliableTimestamp()`) y reloj monotónico para evitar la evasión mediante el cambio de fecha u hora en el celular.
   - Vinculación segura de celulares mediante código de pareamiento numérico de 6 dígitos.
   - Configuración de reglas globales con tarjetas de control (`<ControlCard />`) y etiquetas de estado (`<Badge />`).

2. **Modo Dispositivo Protegido (Hijo / Menor / Adulto):**
   - Motor nativo de protección en segundo plano basado en `VpnService` local de Android.
   - Bloqueo en tiempo real de dominios pertenecientes a la lista oficial LOTBA.
   - **Modal de Validación por Teclado PIN (`<PinKeyboard />`):** Requisito de ingreso del PIN de 4 dígitos del tutor para pausar o reanudar el filtrado.
   - Resiliencia y persistencia tras reinicios del sistema operativo (`BootReceiver`).
   - Operación offline garantizada utilizando la última lista válida en caché local.
   - Telemetría periódica (*heartbeat*) que reporta el estado efectivo de la protección y los permisos.

### Diferencial de Confiabilidad
A diferencia de sistemas convencionales con estados estáticos en base de datos, **BA Protege+** distingue entre la configuración deseada y el **estado efectivo real** (`ACTIVE`, `INACTIVE`, `PERMISSION_REQUIRED`, `BYPASS_DETECTED`, `UNKNOWN`).

```
┌─────────────────────────┐           ┌─────────────────────────┐
│     MODO RESPONSABLE    │           │  DISPOSITIVO PROTEGIDO  │
│  - Dashboard (Hasta 5)  │           │  - Motor Local VPN      │
│  - Auditoría Permisos   │           │  - Teclado PIN          │
│  - Autocontrol 24 Horas │           │  - Caché Offline LOTBA  │
└────────────┬────────────┘           └────────────┬────────────┘
             │                                     │
             └──────────────┐       ┌──────────────┘
                            ▼       ▼
                     ┌─────────────────────┐
                     │    API / BACKEND    │
                     │  - Auth & Pairing   │
                     │  - Server Time (NTP)│
                     │  - Ingesta de Datos │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │    POSTGRESQL 18    │
                     │  - Estado Efectivo  │
                     │  - Listas & Eventos │
                     └──────────┬──────────┘
```

---

## 🎨 Sistema de Diseño y Kit UI/UX

El proyecto cuenta con un **Kit UI/UX estandarizado** basado en las especificaciones oficiales (`uikit.txt` y recursos vectoriales SVG/PNG):

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

## 🛡️ Nuevas Funcionalidades: Auditoría de Permisos, Autocontrol y Límite de Dispositivos

1. **Auditoría de Permisos por Dispositivo:** El responsable visualiza en tiempo real el cumplimiento de los 4 permisos de Android (`4/4 CONCEDIDOS`) y puede desplegar el desglose individual por celular.
2. **Protección para Niños y Adultos:** Cobertura completa para menores de 18 años y autoprotección para adultos.
3. **Gestión de hasta 5 Dispositivos (`MAX_PARENT_DEVICES = 5`):** Un responsable puede vincular y supervisar hasta 5 celulares. El sistema bloquea el intento de emitir un sexto código.
4. **Autocontrol con Bloqueo Inflexible por 24 Horas:** Modal de **Doble Confirmación** y bloqueo inflexible durante 24 horas continuas con cuenta regresiva en vivo (`24h 00m`).
5. **Resiliencia Anti-Manipulación de Reloj (Anti-Bypass):** Validación del tiempo contra el reloj inmutable del servidor/red (NTP) y el reloj monotónico nativo de Android (`SystemClock.elapsedRealtime()`).

---

## 💻 Stack Tecnológico Oficial

| Capa | Tecnología | Versión Baseline |
| :--- | :--- | :--- |
| **Mobile (Frontend)** | React Native + TypeScript | 0.87 / 0.76+ |
| **Kit UI/UX (Design System)** | Custom Theme + Components (`uikit.txt`) | Tokens e Iconografía oficial |
| **Nativo Android** | Kotlin + Android SDK (`VpnService`) | Kotlin 2.x / SDK 35/37 (Java 17) |
| **Simulador Web (Frontend)** | Vite + React + TypeScript | Vite 8 / React 18 |
| **Backend (API REST)** | Node.js (LTS) + Express + TypeScript | Node 24.20 LTS / Express 4/5 |
| **ORM & Base de Datos** | Prisma ORM + PostgreSQL | PostgreSQL 18.6 / Prisma 5.x |
| **Autenticación** | JWT (`jsonwebtoken`) + Hashing (`bcryptjs`) | Estándar con Refresh Tokens |
| **Control de Versiones** | Git + GitHub | Git 2.55+ |

---

## 📂 Estructura del Repositorio (Monorepo)

```text
baprotege+/
├── .github/                      # Automatizaciones y flujos de CI/CD
├── docs/                         # Documentación interna de trabajo
├── backend/                      # API REST (Node.js 24 + Express + TypeScript + Prisma)
│   ├── prisma/                   # Esquema relacional PostgreSQL (schema.prisma)
│   ├── src/
│   │   ├── config/               # Variables de entorno y repositorio mock en memoria
│   │   ├── controllers/          # Manejadores HTTP (Auth, Dispositivos, Listas, Telemetría)
│   │   ├── middlewares/          # Autenticación JWT, validación Zod y manejo de errores
│   │   ├── routes/               # Enrutamiento modular de endpoints (/api)
│   │   ├── services/             # Lógica de negocio (Pairing, Heartbeat, Listas LOTBA)
│   │   └── server.ts             # Punto de entrada y arranque del servidor HTTP
├── frontend/                     # Aplicación Mobile (React Native + Kotlin + Simulador Web)
│   ├── android/                  # Módulos nativos Android (VpnService, BootReceiver, Bridge)
│   ├── src/
│   │   ├── components/           # Componentes del Kit UI/UX (Header, StatusCard, ActionButton, Badge, etc.)
│   │   ├── screens/              # Pantallas de la aplicación móvil (Login, Pairing, Permissions, etc.)
│   │   ├── services/             # API Client y Heartbeat con payload de permisos
│   │   ├── theme/                # Tokens de diseño (colors.ts, typography.ts)
│   │   ├── types/                # Interface DevicePermissionsStatus e Info
│   │   └── web/                  # Simulador interactivo web de pruebas refactorizado
│   ├── tests/                    # Pruebas unitarias (Permissions, SelfControl, UIKit, etc.)
│   ├── ui/                       # Especificaciones e iconografía del Kit UI/UX (uikit.txt, *.svg, *.png)
└── README.md                     # Documentación principal del proyecto
```

---

## ⚙️ Requisitos Previos del Entorno

1. **Node.js:** Versión 24 LTS instalada (`node -v`).
2. **npm:** Versión 11 o superior (`npm -v`).
3. **JDK:** OpenJDK 17 (requerido para compilación de Android / Gradle).
4. **Android Studio (Opcional para pruebas nativas):** Versión Quail 4 (2026.1.4) con Android SDK Platform 35/37.

---

## 🚀 Guía de Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/Innova-Lab-Equipo-21/Innova-Lab-Equipo-21-Control-Parental.git
cd Innova-Lab-Equipo-21-Control-Parental
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

---

## 🧪 Guía de Pruebas Rápidas (Modo Simulado / Sin Base de Datos)

El proyecto incluye un **Modo de Datos Simulados (Mock Data)** y un **Simulador Web Interactivo** para probar todas las funcionalidades de extremo a extremo sin necesidad de instalar PostgreSQL ni configurar emuladores pesados.

### Paso 1: Iniciar el Servidor Backend
En una terminal, ingresar a la carpeta `backend` y ejecutar:
```bash
cd backend
npm run dev
```
*Salida esperada:*
```text
⚡ Modo de Datos Simulados (Mock Data) ACTIVO: Operando sin base de datos externa.
====================================================
🚀 Servidor BA Protege+ ejecutándose en el puerto 3000
🌐 Entorno: development
🔗 Endpoint de salud: http://localhost:3000/api/health
====================================================
```

### Paso 2: Iniciar el Simulador Web del Frontend
En una segunda terminal, ingresar a la carpeta `frontend` y ejecutar:
```bash
cd frontend
npm run dev
```
*Salida esperada:*
```text
  VITE v8.3.0  ready in 150 ms
  ➜  Local:   http://localhost:5173/
```

### Paso 3: Abrir y Probar en el Navegador
Abrir en el navegador la URL indicada: **[http://localhost:5173/](http://localhost:5173/)**

#### Escenarios de prueba interactiva:
1. **🌟 Onboarding y Tutoriales en Video:**
   - Inicio interactivo con los 3 videos paso a paso (*Tutor*, *Menor*, *Adulto*) con reproductor simulado, resumen de puntos clave y barra de tiempo.
2. **🔐 Autenticación y Registro Completo:**
   - **Pantalla de Login:** Acceso con logotipo genérico de candado abierto, campo de email y contraseña con botón para borrar rápidamente (✕) y alternador de visibilidad (👁️ / 🙈).
   - **Acceso Rápido Demo:** Botón para autocompletar con `tutor@baprotege.gob.ar` / `password123`.
   - **Recuperación de Contraseña:** Flujo *"¿Olvidaste tu contraseña?"* con validación de correo y confirmación de envío de instrucciones.
   - **Creación de Cuenta (Registro):** Formulario con disposición vertical completa:
     - `Nombre *` (mínimo 2 caracteres, solo letras).
     - `Apellido *` (mínimo 2 caracteres, solo letras).
     - `Género` (selector horizontal interactivo: *Masculino*, *Femenino*, *Otro*, *No informado*).
     - `Fecha de Nacimiento` (`DD/MM/AAAA` con máscara).
     - `Teléfono` (`XX XXXX-XXXX` con máscara).
     - `Correo Electrónico *` (con validación y botón de borrado).
     - `Contraseña *` (mínimo 6 caracteres con visibilidad).
     - `Confirmar Contraseña *` (validación de coincidencia con contraseña).
3. **🔒 Autocontrol del Responsable con Bloqueo de 24 Horas:**
   - Iniciar el flujo de **Autocontrol con Doble Confirmación**.
   - Probar la modal de Paso 1 y Paso 2.
   - Observar el estado **`🔒 BLOQUEADO 24H`** con el tiempo exacto restante en formato `24h 00m`. Intentar desactivarlo antes de tiempo para verificar la alerta de rechazo.
4. **📱 Límite de 5 Dispositivos por Responsable:**
   - Ver el indicador de capacidad `(X/5) Dispositivos`.
   - Generar códigos de pareamiento de 6 dígitos. Si se intentan agregar más de 5 dispositivos, el sistema bloquea la acción.
5. **🛡️ Solicitud y Auditoría de Permisos del Dispositivo:**
   - Probar la pantalla de solicitud de los 4 permisos de Android (`Servicio VPN`, `Accesibilidad Antidesinstalación`, `Notificaciones` y `Exención de Batería`).
   - Si se continúa con permisos pendientes, verificar la caja de alerta amarilla en la parte superior del dispositivo protegido.
   - En el Panel del Responsable, desplegar *"Ver Detalle"* para auditar el cumplimiento individual de permisos de cada hijo.
6. **📱 Modo Dispositivo Protegido (Hijo / Menor / Adulto):**
   - Pausar o reanudar el motor local de protección VPN ingresando el **PIN del tutor (`1234`)**.
   - **Simulador de Interceptación LOTBA:** Seleccionar un dominio clandestino (ej. `apuestas-online-ilegal.bet`, `casino-sin-licencia.com`) y pulsar *"Simular Intento de Navegación"*. La app interceptará la solicitud, mostrará la alerta roja de bloqueo y enviará el evento en tiempo real al backend.
   - Observar el envío periódico de **Heartbeats** de telemetría.
7. **Consola de Red en Tiempo Real:**
   - La barra lateral izquierda muestra el flujo en vivo de solicitudes HTTP (`GET`, `POST`, `BLOCK`).

---

## 🗄️ Configuración con Base de Datos Real (PostgreSQL 18)

Cuando se desee utilizar una base de datos PostgreSQL real:

1. Configurar el archivo `backend/.env`:
   ```env
   USE_MOCK_DATA=false
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/baprotege_db?schema=public"
   ```
2. Ejecutar las migraciones de Prisma para crear las tablas:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
3. Iniciar el servidor backend:
   ```bash
   npm run dev
   ```

---

## 📱 Ejecución en Emulador / Dispositivo Android (Android Studio)

Guía paso a paso para compilar, instalar y probar la aplicación móvil nativa utilizando `npx react-native run-android` en un emulador de Android Studio (AVD) o dispositivo físico.

---

### ⚙️ 1. Configuración de Variables de Entorno y Requisitos

Para compilar el proyecto Android sin errores de compatibilidad, es **imprescindible utilizar JDK 17** y configurar la ruta del **Android SDK**.

#### 🅰️ En Linux / macOS:
Añadir al archivo `~/.bashrc` o `~/.zshrc`:
```bash
# 1. Instalar JDK 17
sudo apt update && sudo apt install -y openjdk-17-jdk

# 2. Exportar variables de entorno en ~/.bashrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 3. Aplicar los cambios
source ~/.bashrc
```

#### 🅱️ En Windows:
1. Crear la variable de entorno del sistema `JAVA_HOME` apuntando a su instalación de JDK 17 (ej: `C:\Program Files\Java\jdk-17`).
2. Crear la variable `ANDROID_HOME` apuntando al SDK de Android (ej: `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`).
3. Añadir `%ANDROID_HOME%\platform-tools` y `%JAVA_HOME%\bin` a la variable `PATH`.

#### 📝 Archivo `local.properties` (Opcional pero recomendado)
Si Gradle no detecta la ruta del SDK de Android automáticamente, cree o edite el archivo `frontend/android/local.properties`:
```properties
# En Linux:
sdk.dir=/home/TU_USUARIO/Android/Sdk

# En Windows:
# sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

---

### 🚀 2. Pasos para Compilar y Ejecutar con `npx react-native run-android`

#### Paso 1: Iniciar el Servidor Backend API
Asegúrese de que la API REST esté en ejecución (necesario para login, vinculación y telemetría):
```bash
cd backend
npm run dev
```

#### Paso 2: Iniciar el Emulador AVD de Android Studio
- Abra **Android Studio** y vaya a **Tools > Device Manager** (o *Virtual Device Manager*).
- Seleccione su emulador AVD (recomendado Pixel 6/7/8 con API 34 o 35) y presione **Play (▶️)**.

#### Paso 3: Configurar Redireccionamiento de Puertos (ADB Reverse)
Ejecute en la terminal para enlazar los puertos del emulador con su máquina local:
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

#### Paso 4: Empaquetar el Bundle JavaScript Estático
Para empaquetar el código de React Native dentro del APK de Android (previniendo la pantalla roja `Unable to load script`):
```bash
cd frontend
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

#### Paso 5: Iniciar el Empaquetador Metro
En una terminal dentro de la carpeta `frontend`:
```bash
cd frontend
npm start
```

#### Paso 6: Compilar e Instalar la App
En una segunda terminal dentro de la carpeta `frontend`:
```bash
cd frontend
npx react-native run-android
```
*(Alternativamente, puede abrir la carpeta `frontend/android` en Android Studio y presionar el botón **Run ▶️**).*

---

### 🔧 3. Solución de Problemas Frecuentes

- 🔴 **Error `BUG! exception in phase 'semantic analysis' ... Unsupported class file major version 69`:**
  - **Causa:** Su sistema tiene una versión superior de Java activa (como Java 25, versión mayor 69).
  - **Solución:** Cambie la versión activa de Java a **JDK 17** usando `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` (Linux) o ajustando la variable de entorno `JAVA_HOME` a JDK 17 (Windows).
- 🔴 **Error `SDK location not found`:**
  - **Solución:** Verifique la variable `ANDROID_HOME` o añada `sdk.dir=/ruta/a/Android/Sdk` en `frontend/android/local.properties`.
- 🔴 **Red Screen `Unable to load script`:**
  - **Solución:** Ejecute el comando de empaquetado del **Paso 4** (`npx react-native bundle ...`) y asegúrese de tener Metro corriendo (`npm start`) con `adb reverse tcp:8081 tcp:8081`.
- 🌐 **Error de Conexión HTTP al Backend (`localhost`):**
  - **Solución:** En emuladores Android, `http://10.0.2.2:3000/api` apunta a la máquina host. Con `adb reverse tcp:3000 tcp:3000`, la URL `http://localhost:3000/api` también funcionará correctamente.
- 🔒 **Permiso del Servicio VPN:**
  - Al pulsar "Activar Protección", acepte la solicitud emergente del sistema operativo Android para permitir la conexión VPN local de filtrado.
