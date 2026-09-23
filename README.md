# BA Protege+ (Innova Lab Equipo 21 - Control Parental)

<!--
==============================================================================
Proyecto: BA Protege+
Descripción: Documentación general del proyecto de control parental para la
             protección de menores frente a plataformas de apuestas no autorizadas.
==============================================================================
-->

Sistema integral de control parental y protección digital desarrollado para salvaguardar a niños, niñas y adolescentes frente a plataformas de apuestas online y sitios de juegos no autorizados, integrando la lista oficial de **LOTBA (Lotería de la Ciudad de Buenos Aires)** y listas personalizadas administradas por los responsables.

---

## 📌 Tabla de Contenidos

1. [Visión General y Propuesta de Valor](#-visión-general-y-propuesta-de-valor)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Stack Tecnológico Oficial](#-stack-tecnológico-oficial)
4. [Estructura del Repositorio (Monorepo)](#-estructura-del-repositorio-monorepo)
5. [Requisitos Previos del Entorno](#-requisitos-previos-del-entorno)
6. [Guía de Instalación Paso a Paso](#-guía-de-instalación-paso-a-paso)
7. [Guía de Pruebas Rápidas (Modo Simulado / Sin Base de Datos)](#-guía-de-pruebas-rápidas-modo-simulado--sin-base-de-datos)
8. [Configuración con Base de Datos Real (PostgreSQL 18)](#-configuración-con-base-de-datos-real-postgresql-18)
9. [Ejecución en Emulador / Dispositivo Android](#-ejecución-en-emulador--dispositivo-android)

---

## 🎯 Visión General y Propuesta de Valor

El proyecto **BA Protege+** se estructura bajo una solución de dos modos de operación en una única plataforma:

1. **Modo Responsable (Padre / Madre / Tutor):**
   - Panel de control en tiempo real del estado de los dispositivos vinculados.
   - Vinculación segura de dispositivos mediante código de pareamiento numérico de 6 dígitos.
   - Gestión de listas complementarias personalizadas de dominios bloqueados.
   - Historial de intentos de acceso bloqueados y alertas de seguridad anti-bypass.

2. **Modo Dispositivo Protegido (Hijo / Menor):**
   - Motor nativo de protección en segundo plano basado en `VpnService` local de Android.
   - Bloqueo en tiempo real de dominios pertenecientes a la lista oficial LOTBA y personalizada.
   - Resiliencia y persistencia tras reinicios del sistema operativo (`BootReceiver`).
   - Operación offline garantizada utilizando la última lista válida en caché local.
   - Telemetría periódica (*heartbeat*) que reporta el estado efectivo de la protección.

### Diferencial de Confiabilidad
A diferencia de sistemas convencionales con estados estáticos en base de datos, **BA Protege+** distingue entre la configuración deseada y el **estado efectivo real** (`ACTIVE`, `INACTIVE`, `PERMISSION_REQUIRED`, `BYPASS_DETECTED`, `UNKNOWN`).

```
┌─────────────────────────┐           ┌─────────────────────────┐
│     MODO RESPONSABLE    │           │  DISPOSITIVO PROTEGIDO  │
│  - Dashboard de Estado  │           │  - Motor Local VPN      │
│  - Configuración        │           │  - Caché Offline LOTBA  │
│  - Alertas y Reportes   │           │  - Heartbeat Periódico  │
└────────────┬────────────┘           └────────────┬────────────┘
             │                                     │
             └──────────────┐       ┌──────────────┘
                            ▼       ▼
                     ┌─────────────────────┐
                     │    API / BACKEND    │
                     │  - Auth & Pairing   │
                     │  - Sincronización   │
                     │  - Ingesta de Datos │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │    POSTGRESQL 18    │
                     │  - Estado Efectivo  │
                     │  - Listas & Eventos │
                     └─────────────────────┘
```

---

## 💻 Stack Tecnológico Oficial

| Capa | Tecnología | Versión Baseline |
| :--- | :--- | :--- |
| **Mobile (Frontend)** | React Native + TypeScript | 0.87 / 0.76+ |
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
├── docs/                         # Documentación interna de trabajo (ignorada en Git)
├── backend/                      # API REST (Node.js 24 + Express + TypeScript + Prisma)
│   ├── prisma/                   # Esquema relacional PostgreSQL (schema.prisma)
│   ├── src/
│   │   ├── config/               # Variables de entorno y repositorio mock en memoria
│   │   ├── controllers/          # Manejadores HTTP (Auth, Dispositivos, Listas, Telemetría)
│   │   ├── middlewares/          # Autenticación JWT, validación Zod y manejo de errores
│   │   ├── routes/               # Enrutamiento modular de endpoints (/api)
│   │   ├── services/             # Lógica de negocio (Pairing, Heartbeat, Listas LOTBA)
│   │   ├── types/                # Definiciones de tipos TypeScript
│   │   ├── app.ts                # Configuración de Express y middlewares
│   │   └── server.ts             # Punto de entrada y arranque del servidor HTTP
│   ├── .env.example              # Plantilla de variables de entorno
│   ├── package.json              # Dependencias y scripts npm
│   └── tsconfig.json             # Configuración de TypeScript
├── frontend/                     # Aplicación Mobile (React Native + Kotlin + Simulador Web)
│   ├── android/                  # Módulos nativos Android (VpnService, BootReceiver, Bridge)
│   ├── src/
│   │   ├── components/           # Componentes de UI (Header, StatusCard, ActionButton, Logo)
│   │   │   ├── ActionButton.tsx  # Botón con estados de carga y variantes
│   │   │   ├── Header.tsx        # Encabezado institucional
│   │   │   ├── Logo.tsx          # Logotipo genérico con isotipo de candado abierto y tipografía oficial
│   │   │   └── StatusCard.tsx    # Tarjeta de estado efectivo de protección
│   │   ├── screens/              # Pantallas de la aplicación móvil
│   │   │   ├── LoginScreen.tsx   # Autenticación, Recuperación de contraseña y Creación de cuenta
│   │   │   ├── PairingScreen.tsx # Pantalla de vinculación por código de 6 dígitos
│   │   │   ├── ParentDashboardScreen.tsx # Panel del responsable y gestión de dispositivos
│   │   │   ├── ProtectedDeviceScreen.tsx # Panel de control del menor y simulador de bloqueo
│   │   │   └── WelcomeScreen.tsx # Selección de rol (Responsable vs. Protegido)
│   │   ├── services/             # Clientes de API REST y puente de protección VpnService
│   │   │   ├── api.service.ts    # Cliente HTTP Axios (Login, Register, Recovery, Pairing, Telemetría)
│   │   │   └── vpn.service.ts    # Servicio puente con ProtectionModule nativo
│   │   ├── theme/                # Paleta de colores e identidad visual (colors.ts)
│   │   ├── types/                # Definiciones de tipos TypeScript globales
│   │   ├── web/                  # Simulador interactivo web de pruebas
│   │   └── App.tsx               # Componente raíz y navegación
│   ├── index.html                # Entrada del simulador web
│   ├── vite.config.ts            # Configuración de Vite
│   ├── package.json
│   └── tsconfig.json
├── .gitignore                    # Reglas globales de exclusión Git
├── .prettierrc                   # Reglas de formato de código
└── README.md                     # Documentación principal del proyecto
```

---

## ⚙️ Requisitos Previos del Entorno

1. **Node.js:** Versión 24 LTS instalada (comprobar con `node -v`).
2. **npm:** Versión 11 o superior (comprobar con `npm -v`).
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
1. **Autenticación y Registro (Modo Responsable):**
   - **Pantalla de Login:** Acceso con logotipo genérico de candado abierto, campo de email y contraseña con botón para borrar rápidamente (✕) y alternador de visibilidad (👁️ / 🙈).
   - **Acceso Rápido Demo:** Botón para autocompletar con `tutor@baprotege.gob.ar` / `password123`.
   - **Recuperación de Contraseña:** Flujo "¿Olvidaste tu contraseña?" con validación de correo y confirmación de envío de instrucciones.
   - **Creación de Cuenta (Registro):** Formulario con disposición vertical completa:
     - `Nombre *` (mínimo 2 caracteres, solo letras).
     - `Apellido *` (mínimo 2 caracteres, solo letras).
     - `Género` (carrusel horizontal interactivo: *Masculino*, *Femenino*, *Otro*, *No informado* con indicadores de posición).
     - `Fecha de Nacimiento` (`DD/MM/AAAA` con máscara).
     - `Teléfono` (`XX XXXX-XXXX` con máscara).
     - `Correo Electrónico *` (con validación y botón de borrado).
     - `Contraseña *` (mínimo 6 caracteres con botón de borrado y visibilidad).
     - `Confirmar Contraseña *` (validación de coincidencia con botón de borrado y visibilidad).
2. **Panel de Control del Responsable:**
   - Visualización de dispositivos vinculados (`Mateo`, `Sofía`, `Lucas`) con sus estados efectivos (`ACTIVE`, `PERMISSION_REQUIRED`).
   - Botón **"Generar Código (6 dígitos)"** para emitir un nuevo código de pareamiento temporal (15 minutos).
   - Gestión de **Lista Personalizada** de dominios bloqueados.
3. **Modo Dispositivo Protegido (Hijo / Menor):**
   - Pausar o reanudar el motor local de protección VPN.
   - **Simulador de Interceptación LOTBA:** Seleccionar un dominio clandestino (ej. `apuestas-online-ilegal.bet`, `casino-sin-licencia.com`) y pulsar **"Simular Intento de Navegación"**. La app interceptará la solicitud, mostrará la alerta roja de bloqueo y enviará el evento en tiempo real al backend.
   - Observar el envío periódico de **Heartbeats** de telemetría.
4. **Consola de Red en Tiempo Real:**
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

Guía completa para compilar, instalar y probar la aplicación móvil nativa con React Native y Android Studio en un emulador de Android (AVD) o dispositivo físico.

### 📋 Requisitos Previos:
1. **Android Studio** (versión 2024.1+ / 2026.1.4+) instalado.
2. **Android SDK Platform 34/35/37** y **Android SDK Build-Tools** instalados desde el *SDK Manager* en Android Studio.
3. **Android Virtual Device (AVD)** creado e iniciado (recomendado Pixel 6/7/8 con API 34 o 35).
4. **JDK 17** configurado en las variables de entorno de su sistema (`JAVA_HOME`).

---

### 🚀 Paso a Paso de Ejecución e Instalación:

#### 1. Iniciar el Servidor Backend
Asegúrese de que la API REST del backend esté ejecutándose en el puerto 3000:
```bash
cd backend
npm run dev
```

#### 2. Iniciar el Emulador Android
- Abra **Android Studio**.
- Diríjase a **Tools > Device Manager** (o *Virtual Device Manager*).
- Seleccione su emulador AVD y presione el botón **Play (▶️)** para iniciar el dispositivo.

#### 3. Configurar Redireccionamiento de Puertos (ADB Reverse)
Para permitir que el emulador Android se comunique correctamente con el empaquetador Metro y con el servidor Backend corriendo en su máquina local (`localhost`), ejecute en la terminal:
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```
> **Nota de red en emuladores:** Por defecto, la dirección IP `10.0.2.2` dentro del emulador apunta al `localhost` de su computadora host.

#### 4. Generar el Bundle JavaScript Estático (Recomendado)
Para empaquetar el código de React Native dentro de los assets del APK de Android (evitando errores de carga de script):
```bash
cd frontend
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

#### 5. Iniciar el Metro Bundler
En una terminal dentro de la carpeta `frontend`:
```bash
cd frontend
npm start
```

#### 6. Compilar e Instalar la App en el Emulador
En una segunda terminal, ejecute:
```bash
cd frontend
npm run android
```
*(También puede abrir la carpeta `frontend/android` directamente en Android Studio y pulsar el botón **Run (Play ▶️)**).*

---

### 🔧 Solución de Problemas Frecuentes en Emulador:

- 🔴 **Error "Unable to load script" (Red Screen):**
  - Verifique que Metro esté ejecutándose (`npm start`) y ejecute `adb reverse tcp:8081 tcp:8081`.
  - Asegúrese de haber generado el bundle estático con el comando del **Paso 4**.
- 🌐 **Error de Conexión con el Backend (`localhost`):**
  - En el emulador de Android Studio, la URL para acceder a su máquina local es `http://10.0.2.2:3000/api`. Ejecutar `adb reverse tcp:3000 tcp:3000` permite usar `http://localhost:3000/api`.
- 🔒 **Servicio VPN en Emulador:**
  - El emulador de Android Studio soporta completamente el `VpnService` nativo de Android. Al pulsar "Activar Protección" en la pantalla de la app, el sistema operativo Android mostrará un diálogo pidiendo confirmación de permiso para la conexión VPN local. Acepte el permiso para activar el filtrado de dominios LOTBA.