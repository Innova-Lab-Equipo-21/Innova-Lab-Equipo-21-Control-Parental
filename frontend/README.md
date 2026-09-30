# BA Protege+ — Frontend Mobile & Simulador Web

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile
Archivo: frontend/README.md
Descripción: Documentación técnica, guía de instalación, ejecución del simulador
             interactivo y desarrollo de módulos nativos Android en Kotlin.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con integración de módulos nativos en **Kotlin 2.x** para filtrado local mediante `VpnService` de Android y un **Simulador Web Interactivo con Vite** para pruebas inmediatas en el navegador.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Guía de Instalación y Pruebas Web (Rápida)](#-guía-de-instalación-y-pruebas-web-rápida)
4. [Módulos Nativos Android en Kotlin](#-módulos-nativos-android-en-kotlin)
5. [Ejecución Nativa en Android Studio / Emulador](#-ejecución-nativa-en-android-studio--emulador)
6. [Funcionalidades y Escenarios de Prueba](#-funcionalidades-y-escenarios-de-prueba)

---

## 🛠️ Tecnologías y Arquitectura

- **Framework Móvil:** React Native 0.87 (TypeScript)
- **Simulador Web:** Vite 8 + React 18 + TypeScript (puerto `5173`)
- **Capa Nativa Android:** Kotlin 2.x / Android SDK Platform 35/37 (Java 17)
- **Motor de Filtrado:** `android.net.VpnService` local con caché offline
- **Anti-Bypass & Resiliencia:** `BootReceiver` (`RECEIVE_BOOT_COMPLETED`)
- **Servicios en Primer Plano:** `NotificationManager` con canal persistente de seguridad
- **Puente Nativo:** `ProtectionModule` (`ReactContextBaseJavaModule`)
- **Cliente HTTP:** Axios con interceptores JWT para comunicación con el backend (`http://localhost:3000/api`)

---

## 📁 Estructura del Proyecto

```text
frontend/
├── android/                                  # Proyecto nativo Android (Gradle, Kotlin)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml           # Permisos de VpnService, BootReceiver y Foreground
│   │   │   └── java/com/baprotege/
│   │   │       ├── vpn/
│   │   │       │   ├── ProtectionVpnService.kt # Motor VPN nativo y loop de filtrado de paquetes
│   │   │       │   ├── LotbaFilterEngine.kt  # Motor de reglas LOTBA y almacenamiento offline
│   │   │       │   └── VpnNotificationManager.kt # Gestor de notificación persistente
│   │   │       ├── receiver/
│   │   │       │   └── BootReceiver.kt       # Resiliencia y arranque automático tras reboot
│   │   │       └── bridge/
│   │   │           ├── ProtectionModule.kt   # Módulo puente React Native <-> Kotlin
│   │   │           └── ProtectionPackage.kt  # Registro del paquete en React Native
│   │   └── build.gradle                      # Compilación Android (Java 17, SDK 35/37)
│   ├── build.gradle                          # Plugins Gradle y Kotlin 2.x
│   └── settings.gradle
├── src/
│   ├── components/                           # Componentes visuales reutilizables
│   │   ├── ActionButton.tsx                  # Botón con estados de carga y variantes
│   │   ├── Header.tsx                        # Encabezado institucional
│   │   ├── Logo.tsx                          # Logotipo genérico con candado abierto y tipografía oficial
│   │   └── StatusCard.tsx                    # Tarjeta de estado efectivo de protección
│   ├── screens/                              # Pantallas de la aplicación móvil
│   │   ├── LoginScreen.tsx                   # Pantalla de Autenticación, Recuperación y Registro
│   │   ├── PairingScreen.tsx                 # Pantalla de vinculación por código de 6 dígitos
│   │   ├── ParentDashboardScreen.tsx         # Panel del responsable y gestión de dispositivos
│   │   ├── ProtectedDeviceScreen.tsx         # Panel de control del menor y simulador de bloqueo
│   │   └── WelcomeScreen.tsx                 # Selección de rol (Responsable vs. Protegido)
│   ├── services/                             # Lógica de comunicación y puentes
│   │   ├── api.service.ts                    # Cliente HTTP Axios (Login, Register, RecoverPassword, Telemetría)
│   │   └── vpn.service.ts                    # Servicio puente con ProtectionModule nativo
│   ├── theme/                                # Tokens de diseño y colores
│   │   └── colors.ts
│   ├── types/                                # Definición de tipos TypeScript globales
│   │   └── index.ts
│   ├── web/                                  # Simulador web interactivo para pruebas
│   │   ├── main.tsx                          # Punto de montaje del simulador web
│   │   ├── simulator.css                     # Estilos de marco de teléfono, carrusel y panel de red
│   │   └── WebSimulator.tsx                  # Componente interactivo con teléfono virtual
│   └── App.tsx                               # Componente raíz de React Native
├── index.html                                # Entrada HTML para el simulador web Vite
├── vite.config.ts                            # Configuración de Vite
├── package.json                              # Dependencias y scripts npm
└── tsconfig.json                             # Configuración del compilador TypeScript
```

---

## ⚡ Guía de Instalación y Pruebas Web (Rápida)

Para probar la interfaz, los flujos de usuario y la comunicación en tiempo real con el backend sin necesidad de compilar Android Studio:

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Iniciar el Simulador Web
Asegurarse de que el servidor backend esté corriendo en el puerto 3000 (`npm run dev` en `backend/`), luego ejecutar:
```bash
npm run dev
```

### 3. Abrir en el navegador
Ingresar a: **[http://localhost:5173/](http://localhost:5173/)**

---

## ⚙️ Módulos Nativos Android en Kotlin

1. **`ProtectionVpnService.kt`**:
   - Crea una interfaz virtual de túnel local (`10.0.0.2/32`) mediante `VpnService.Builder`.
   - Implementa `startForeground` con canal de notificación dedicado `ba_protege_vpn_channel`.
   - Inspecciona paquetes DNS en hilo desacoplado para filtrar sitios clandestinos.
2. **`LotbaFilterEngine.kt`**:
   - Mantiene la lista oficial de LOTBA en memoria concurrente (`ConcurrentHashMap`).
   - **Modo Offline:** Guarda y carga automáticamente la última lista válida en `SharedPreferences`.
3. **`BootReceiver.kt`**:
   - Escucha `BOOT_COMPLETED`, `MY_PACKAGE_REPLACED` y `QUICKBOOT_POWERON`.
   - Si la protección estaba activa, reinicia el servicio VPN inmediatamente al encender el celular.
4. **`ProtectionModule.kt`**:
   - Expone métodos nativos a TypeScript:
     - `prepareVpn()`: Solicita autorización del sistema operativo Android.
     - `startProtection()`: Inicia el servicio VPN local.
     - `stopProtection()`: Detiene el servicio VPN.
     - `isProtectionActive()`: Consulta el estado en tiempo real.
     - `updateBlocklist(version, domains)`: Sincroniza dominios en memoria y caché local.
     - `getBlocklistInfo()`: Retorna versión y total de dominios registrados.

---

## 📱 Ejecución Nativa en Android Studio / Emulador

Guía paso a paso para compilar, instalar y probar la aplicación móvil nativa utilizando `npx react-native run-android` en un emulador de Android Studio (AVD) o dispositivo físico.

---

### ⚙️ 1. Configuración de Variables de Entorno (Requisito JDK 17)

Es **imprescindible utilizar JDK 17** para evitar errores de compilación de Gradle (`Unsupported class file major version 69`).

#### 🅰️ En Linux / macOS (`~/.bashrc` o `~/.zshrc`):
```bash
# 1. Instalar JDK 17
sudo apt update && sudo apt install -y openjdk-17-jdk

# 2. Configurar variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 3. Aplicar cambios
source ~/.bashrc
```

#### 📝 Configuración de `local.properties`:
En el archivo `frontend/android/local.properties`, configure la ruta de su Android SDK:
```properties
# En Linux:
sdk.dir=/home/TU_USUARIO/Android/Sdk

# En Windows:
# sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

---

### 🚀 2. Pasos para Probar en el Emulador con `npx react-native run-android`:

#### Paso 1: Iniciar el Backend API
```bash
cd backend
npm run dev
```

#### Paso 2: Iniciar el Emulador AVD
- Abra Android Studio y navegue a **Virtual Device Manager**.
- Inicie su dispositivo virtual AVD (recomendado Pixel 6/7/8 con API 34 o 35).

#### Paso 3: Redireccionar Puertos (ADB Reverse)
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

#### Paso 4: Empaquetar el Bundle JavaScript
```bash
cd frontend
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

#### Paso 5: Iniciar Metro Bundler
En una terminal dentro de `frontend`:
```bash
npm start
```

#### Paso 6: Compilar e Instalar con `npx react-native run-android`
En una segunda terminal dentro de `frontend`:
```bash
npx react-native run-android
```
*(También puede abrir la carpeta `frontend/android` en Android Studio y pulsar **Run ▶️**).*

---

### 🔧 3. Solución de Problemas Frecuentes:

- 🔴 **Error `Unsupported class file major version 69`:** Indico que su sistema tiene Java 25 activo. Configure `JAVA_HOME` apuntando al **JDK 17**.
- 🔴 **Error `SDK location not found`:** Verifique `ANDROID_HOME` o configure `sdk.dir` en `frontend/android/local.properties`.
- 🔴 **Red Screen `Unable to load script`:** Ejecute el paso de bundle (`npx react-native bundle ...`) e inicie Metro (`npm start`).
- 🌐 **Conexión al Backend:** La URL `http://10.0.2.2:3000/api` o `http://localhost:3000/api` (con `adb reverse tcp:3000 tcp:3000`) funcionan correctamente en el emulador.

---

## 🧪 Funcionalidades y Escenarios de Prueba

### 1. Flujo de Autenticación (`LoginScreen.tsx`):
- **Logotipo Oficial:** Isotipo de candado abierto 🔓 con badge institucional y texto `"BA Protege+ - Control Parental y Protección Digital"`.
- **Inicio de Sesión:**
  - Correo electrónico con botón de borrado rápido (✕).
  - Contraseña con botón de borrado (✕) y alternador de visibilidad (👁️ / 🙈).
  - Acceso directo con credenciales demo (`tutor@baprotege.gob.ar` / `password123`).
- **Recuperación de Contraseña:**
  - Formulario con instrucciones en español y validación de correo para restablecimiento de acceso.
- **Creación de Cuenta (Registro):**
  - Disposición vertical completa de todos los campos:
    1. `Nombre *` (mínimo 2 caracteres, solo letras).
    2. `Apellido *` (mínimo 2 caracteres, solo letras).
    3. `Género` (carrusel horizontal interactivo con tarjetas de selección e indicadores de puntos: *Masculino*, *Femenino*, *Otro*, *No informado*).
    4. `Fecha de Nacimiento` (`DD/MM/AAAA` con máscara).
    5. `Teléfono` (`XX XXXX-XXXX` con máscara).
    6. `Correo Electrónico *` (con botón de borrado).
    7. `Contraseña *` (mínimo 6 caracteres, con botón de borrado y visibilidad).
    8. `Confirmar Contraseña *` (validación de coincidencia con contraseña).

### 2. Panel del Responsable (`ParentDashboardScreen.tsx`):
- **Monitoreo en Tiempo Real:** Estado de los dispositivos vinculados (`Mateo` - Activo, `Sofía` - Activo, `Lucas` - Atención requerida).
- **Generar Código de Pareamiento:** Emisión de token de 6 dígitos válido por 15 minutos.
- **Dominios Personalizados:** Administración de listas complementarias del tutor.

### 3. Modo Dispositivo Protegido (`ProtectedDeviceScreen.tsx`):
- **Estado VPN en Vivo:** Alternar entre *"Pausar Protección"* y *"Reanudar Protección"*.
- **Prueba de Interceptación LOTBA:** Selección y prueba de bloqueo inmediato ante dominios no autorizados.
- **Telemetría Periódica:** Emisión automática de latidos de estado (cada 12 segundos).
