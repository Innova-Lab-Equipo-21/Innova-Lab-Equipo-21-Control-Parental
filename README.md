# BA Protege+ (Innova Lab Equipo 21 - Control Parental)

<!--
==============================================================================
Proyecto: BA Protege+
Descripción: Documentación general del proyecto de control parental para la
             protección de menores y autocontrol de adultos frente a plataformas
             de apuestas no autorizadas.
==============================================================================
-->

Sistema integral de control parental y protección digital desarrollado para salvaguardar a niños, niñas, adolescentes y adultos frente a plataformas de apuestas online y sitios de juegos no autorizados, integrando el **Kit UI/UX del Sistema de Diseño oficial**, la lista de la **LOTBA (Lotería de la Ciudad de Buenos Aires)**, **Onboarding con Wizard de 3 Pantallas y Video Optativo**, **Auditoría de Permisos de Dispositivos Protegidos**, **Autocontrol del Responsable con ciclo de 24 horas**, **Gestión CRUD de Sitios Web y Aplicaciones Bloqueadas**, **Monitorización de Tiempo de Uso de Pantalla**, **Estandarización de Interfaz en Sentence Case**, **Restricción de Mayoría de Edad (+18)** y gestión de **hasta 5 dispositivos por responsable**.

---

## 📌 Tabla de Contenidos

1. [Visión General y Propuesta de Valor](#-visión-general-y-propuesta-de-valor)
2. [Sistema de Diseño y Kit UI/UX](#-sistema-de-diseño-y-kit-uiux)
3. [Funcionalidades del Sistema](#-funcionalidades-del-sistema)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Stack Tecnológico Oficial](#-stack-tecnológico-oficial)
6. [Estructura del Repositorio (Monorepo)](#-estructura-del-repositorio-monorepo)
7. [Requisitos Previos del Entorno](#-requisitos-previos-del-entorno)
8. [Guía de Instalación Paso a Paso](#-guía-de-instalación-paso-a-paso)
9. [Guía de Pruebas Rápidas (Modo Simulado / Sin Base de Datos)](#-guía-de-pruebas-rápidas-modo-simulado--sin-base-de-datos)
10. [Configuración con Base de Datos Real (PostgreSQL 18 / Supabase) y Railway](#-configuración-con-base-de-datos-real-postgresql-18--supabase-y-railway)
11. [Compilación de APK de Release y Distribución](#-compilación-de-apk-de-release-y-distribución)
12. [Ejecución en Emulador / Dispositivo Android](#-ejecución-en-emulador--dispositivo-android)

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

### 3. UX Writing
  * **[Brandbook - BA Protege + (Guía de voz y tonos)](https://drive.google.com/file/d/18inWXJ7TpJ5TQAubSFvHRwZSo8CLxpG5/view?usp=sharing)**

---

## 🛠️ Funcionalidades del Sistema

El sistema **BA Protege+** integra un conjunto completo de funcionalidades diseñadas para garantizar la seguridad digital de la familia, el control parental riguroso y la autoprotección responsable de adultos frente a plataformas de apuestas clandestinas y contenidos restringidos.

### 1. Selección de Modo Operativo y Perfiles de Usuario (Paso 2)
- **Modo Responsable (Padre / Madre / Tutor):** Diseñado para adultos a cargo del grupo familiar. Otorga control completo para supervisar hasta 5 dispositivos protegidos, configurar reglas personalizadas de sitios y aplicaciones, monitorear el tiempo de uso de pantalla y activar el autocontrol propio.
- **Modo Dispositivo Protegido (Menor / Adulto en Tratamiento):** Diseñado para instalarse en el dispositivo a proteger. Opera con un motor de filtrado local en segundo plano que bloquea de forma transparente más de 450 dominios clandestinos y aplicaciones restringidas, reforzado con protección antidesinstalación.

### 2. Autenticación y Registro con Restricción de Mayoría de Edad (+18) (Paso 3A)
- **Validación Estricta de Edad:** Registro de responsables restringido a mayores de 18 años mediante cálculo dinámico exacto de fecha de nacimiento (`DD/MM/AAAA`). Bloqueo preventivo automático ante usuarios menores de edad.
- **Iniciaciones de Sesión Flexibles:** Soporte para autenticación nativa mediante correo/contraseña y acceso directo simplificado con **Google Auth** e ícono oficial (`logo_google.png`).
- **Modales Legales Bottom Sheet y Calendario:** Integración de modales emergentes con tirador de arrastre para Términos y Condiciones (`TermsModal`), Políticas de Privacidad (`PrivacyModal`) y selector encapsulado de fechas (`DatePickerModal`).

### 3. Vinculación Dual y Límite de 5 Dispositivos Protegidos (Paso 3B)
- **Mecanismos de Pareamiento:** Vinculación ágil en menos de 1 minuto a través de código numérico de 6 dígitos con validez temporal o mediante escaneo directo de **Código QR** con la cámara del celular.
- **Límite Estricto de Dispositivos (`MAX_PROTECTED_DEVICES = 5`):** Capacidad de vinculación limitada a un máximo de 5 celulares supervisados por responsable. Al alcanzar el cupo, la interfaz de emparejamiento deshabilita automáticamente la generación de nuevos códigos.

### 4. Configuración y Auditoría de Permisos del Sistema Android (Paso 4)
- **Estructura en Acordeón Pedagógico:** Presentación guiada e individual de los 5 permisos críticos del sistema Android requeridos para garantizar la efectividad de la protección:
  1. `Servicio VPN Local`: Intercepción y filtrado de tráfico web en la capa de red.
  2. `Servicio de Accesibilidad`: Prevención de desinstalación no autorizada de la app.
  3. `Notificaciones del Sistema`: Envío de alertas de seguridad y estado persistente.
  4. `Exención de Optimización de Batería`: Garantía de ejecución continua en segundo plano.
  5. `Ubicación y Geolocalización (GPS / IP Híbrida)`: Registro de posición geográfica del celular.
- **Auditoría en Tiempo Real:** El responsable puede consultar desde el panel el estado exacto de permisos concedidos o revocados en cada uno de los celulares vinculados.

### 5. Panel del Responsable y Módulos de Gestión (Paso 5A)
El panel principal cuenta con barra de navegación inferior de 5 pestañas (`DashboardNavbar.tsx`) con resalte visual `#E5F1FF` y acceso unificado por secciones retráctiles (`SeccionDesplegable.tsx`):

- **A. Vista Inicio (Panel):**
  - **Tarjetas de Resumen General:** Indicadores de dispositivos vinculados (`X/5`), reglas activas (`3/3`) y estado del autocontrol (`Off` / `🔒 Activa`).
  - **Accesos Rápidos:** Grid de 4 accesos directos (*"Mis dispositivos"*, *"Gestión de sitios"*, *"Actividad y alertas"*, *"Autocontrol tutor"*).
  - **Secciones Desplegables Integradas:** Acceso directo desde la pantalla inicial a todos los módulos sin necesidad de cambiar de pestaña.
- **B. Mis Dispositivos Protegidos:**
  - Ficha detallada de cada celular supervisado con nivel de batería, estado del filtro, versión de lista y resumen de permisos.
  - **Desvinculación Segura:** Opción para remover un dispositivo previa confirmación mediante modal de advertencia preventiva.
- **C. Gestión de Sitios y Apps:**
  - **🌐 Sitios web:** Filtro oficial LOTBA inmutable (más de 450 dominios de apuestas clandestinas bloqueados de forma obligatoria) + CRUD de dominios personalizados con sanitización de URLs, categorización y pausa/reanudación individual (`isActive`).
  - **📱 Aplicaciones:** Bloqueo de aplicaciones móviles Android (Bet365, TikTok, Pokerstars, Instagram, juegos, etc.) con selección de asignación global o a dispositivos específicos (`deviceIds`).
  - **📊 Tiempo de uso:** Medición e historial gráfico de minutos y horas de consumo diario de pantalla por aplicativo para cada dispositivo (incluyendo el celular del propio responsable).
  - **Filtro por Dispositivo:** Conmutación rápida para listar reglas de `🌎 Todos`, `📱 Mi dispositivo` o celulares protegidos específicos.
  - **Ordenamiento:** Alternancia entre `📅 Fecha de inclusión` (más recientes) y `🔤 A-Z` (alfabético).
- **D. Actividad del Sistema:**
  - Histórico de eventos de dominios bloqueados, intentos de navegación no autorizados y alertas de evasión o manipulación del sistema.
- **E. Perfil y Cuenta:**
  - Gestión de la cuenta del tutor, auditoría de permisos locales y acceso directo a la activación del autocontrol.

### 6. Autocontrol del Responsable (Autoprotección de Adulto) con Bloqueo de 24 Horas
- **El Responsable como 6º Dispositivo:** Ocurre directamente en el celular del tutor, ocupando un perfil propio de autoprotección.
- **Máquina de Estados de 4 Pasos:**
  1. `ACTIVE`: Autoprotección activa de forma permanente bloqueando sitios de apuestas en su propio perfil.
  2. `COOLING_DOWN` (Enfriamiento de 24 Horas): Al solicitar la desactivación, el sistema **NO desbloquea inmediatamente**. Se activa un temporizador irrestricto de 24 horas de espera con reloj regresivo en tiempo real para evitar impulsos.
  3. `DEACTIVATION_READY`: Una vez cumplidas las 24 horas de enfriamiento, el botón se habilita para exigir un **segundo clic consciente** de confirmación.
  4. `TEMPORARILY_UNLOCKED` (Pase Temporal): El sistema otorga un pase de gracia de 24 horas. Al expirar el plazo, el autocontrol se reactiva de forma automática y transparente.

### 7. Motor Nativo de Filtrado e Intercepción en Dispositivo Protegido (Paso 5B)
- **Filtrado en Capa de Red (`VpnService`):** Funciona a nivel de conectividad del sistema Android. Intercepta y bloquea solicitudes a sitios prohibidos en **Aba Anônima / Modo Incógnito** de cualquier navegador y dentro de cualquier app.
- **Protección Antidesinstalación con Teclado PIN (`PinKeyboard`):** El servicio de accesibilidad exige ingresar el PIN de 4 dígitos del responsable para pausar el filtro o intentar desinstalar la app.
- **Operación Offline e Inviolabilidad de Hora:** Mantiene caché local con la última lista válida de dominios y valida el tiempo mediante servidor NTP/red (`getReliableTimestamp()`) impidiendo el salto del bloqueo mediante el cambio de fecha/hora en el celular.

### 8. Onboarding Guiado con Wizard de 3 Pantallas y Video Resumen Optativo
- **Stepper Circular Numerado (`<ProgressSteps />`):** Indicador de progreso `(1) ── (2) ── (3)` accesible.
- **Compromiso Ético de Privacidad:** Garantía explícita de que la app **NO lee mensajes privados, fotos, llamadas ni contraseñas**.
- **Video Tutorial Resumen (35 Segundos):** Reproductor simulado interactivo con subtítulos y explicaciones sobre los 3 perfiles de uso, de carácter optativo y no bloqueante.

### 9. Estándar de Diseño en Sentence Case y Modales Accesibles
- **Estandarización Tipográfica:** Norma estricta de capitalización en formato **Sentence case** en todos los títulos, subtítulos, botones e ítemes de la interfaz (*"Gestión de sitios y apps"*, *"Mis dispositivos protegidos"*, *"Actividad del sistema"*).
- **Modales Agrupados y Accesibles:** Pop-ups con botón de cierre de esquina **"✕"**, imagen oficial del bot (`beti.png`) y disposición horizontal de botones de acción (`gap: 12`).

---

## 💻 Stack Tecnológico Oficial

| Capa | Tecnología | Versión Baseline |
| :--- | :--- | :--- |
| **Mobile (Frontend)** | React Native + TypeScript | 0.87 / 0.76+ |
| **Kit UI/UX (Design System)** | Custom Theme + Components (`uikit.txt`) | Tokens e Iconografía oficial |
| **Nativo Android** | Kotlin + Android SDK (`VpnService`) | Kotlin 2.x / SDK 35/37 (Java 17) |
| **Backend (API REST)** | Node.js (LTS) + Express + TypeScript | Node 24.20 LTS / Express 4.x (desplegado en **Railway**) |
| **ORM & Base de Datos** | Prisma ORM + PostgreSQL (Supabase) | PostgreSQL 18.6 / Prisma 5.22 |
| **Autenticación** | Firebase Auth + Google Sign-In + JWT (`jsonwebtoken`) + `bcryptjs` | Intercambio de tokens Firebase (`accounts:signInWithIdp`) + Google OAuth nativo |
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
│   │   ├── controllers/          # Manejadores HTTP (Auth, Dispositivos, Listas, Blocklist Personalizada, Telemetría)
│   │   ├── middlewares/          # Autenticación JWT, validación Zod y manejo de errores
│   │   ├── routes/               # Enrutamiento modular de endpoints (/api)
│   │   ├── services/             # Lógica de negocio (Pairing, Heartbeat, Listas LOTBA, Blocklist)
│   │   └── server.ts             # Punto de entrada y arranque del servidor HTTP
│   └── tests/                    # Pruebas automatizadas (Blocklist CRUD, Permisos, Auth, etc.)
├── frontend/                     # Aplicación Mobile (React Native + Kotlin)
│   ├── android/                  # Módulos nativos Android (VpnService, BootReceiver, Bridge)
│   ├── src/
│   │   ├── components/           # Componentes del Kit UI/UX (Header, StatusCard, ActionButton, Badge, etc.)
│   │   ├── screens/              # Pantallas de la aplicación móvil (Login, Register, Dashboard, Pairing, etc.)
│   │   ├── services/             # API Client y Heartbeat con payload de permisos
│   │   ├── theme/                # Tokens de diseño (colors.ts, typography.ts)
│   │   ├── types/                # Interface DevicePermissionsStatus, Blocklist, etc.
│   │   └── utils/                # Utilidades y validaciones (age.ts: cálculo de mayoría de edad +18)
│   ├── tests/                    # Pruebas unitarias (CustomBlocklist, Permissions, SelfControl, Age, UIKit)
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

## 🧪 Guía de Pruebas y Ejecución de la Aplicación (Modo Simulado / Sin Base de Datos)

El proyecto incluye un **Modo de Datos Simulados (Mock Data)** en el Backend para probar todas las funcionalidades de extremo a extremo sin necesidad de instalar PostgreSQL. La aplicación móvil se ejecuta en un celular físico o emulador Android mediante la generación de su APK.

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

### Paso 2: Compilar e Instalar la APK en Emulador o Celular Físico
En una segunda terminal, ingresar a la carpeta `frontend`:
```bash
cd frontend

# 1. Empaquetar el bundle de React Native
npm run build:bundle

# 2. Compilar la APK Debug
npm run build:apk
# El APK generado se ubica en: frontend/android/app/build/outputs/apk/debug/app-debug.apk

# 3. Instalar y ejecutar directamente en el dispositivo conectado (emulador o celular vía USB):
npm run install:device

# O alternativamente:
npm run android
```

### Paso 3: Probar en el Dispositivo (Emulador / Celular Físico)

#### Escenarios de prueba interactiva:
1. **🌟 Onboarding con Wizard de 3 Pantallas y Video Optativo:**
   - **Navegación Stepper:** Observar la barra superior con los círculos numerados `(1) ── (2) ── (3)` y botón *"Saltar introducción ✕"*.
   - **Pantalla 1 (Bienvenida y Privacidad):** Leer el aval de LOTBA y el banner de compromiso de privacidad (*sin acceso a WhatsApp, fotos ni chats*). Presionar *"Siguiente: Conocer los 3 Perfiles ➔"*.
   - **Pantalla 2 (Los 3 Perfiles):** Revisar las tarjetas explicativas de *Modo Responsable*, *Dispositivo Menor* y *Dispositivo Adulto*. Probar el botón *"⬅ Volver"* y avanzar con *"Siguiente: Video Optativo ➔"*.
   - **Pantalla 3 (Video Resumen y FAQ):** Probar el reproductor interactivo de 35 segundos (play ▶ / pausa ⏸, subtítulos sincronizados y botón de reiniciar ↺), verificar que el video es optativo y se puede avanzar directamente con *"¡Comenzar! Seleccionar Modo ➔"*. Desplegar las preguntas frecuentes (FAQ).
2. **🔐 Autenticación y Registro con Validación de Mayoría de Edad (+18):**
   - **Pantalla de Login:** Acceso con logotipo genérico de candado abierto, campo de email y contraseña con botón para borrar rápidamente (✕) y alternador de visibilidad (👁️ / 🙈).
   - **Acceso Rápido Demo:** Botón para autocompletar con `tutor@baprotege.gob.ar` / `password123`.
   - **Recuperación de Contraseña:** Flujo *"¿Olvidaste tu contraseña?"* con validación de correo y confirmación de envío de instrucciones.
   - **Creación de Cuenta (Registro):** Formulario con disposición vertical completa:
     - `Nombre *` (mínimo 2 caracteres, solo letras).
     - `Apellido *` (mínimo 2 caracteres, solo letras).
     - `Género` (selector horizontal interactivo: *Masculino*, *Femenino*, *Otro*, *No informado*).
     - `Fecha de Nacimiento` (`DD/MM/AAAA` con máscara): **Prueba de Validación +18**:
       - Ingresar una fecha de menor (ej. año `2012` o `2015`): inmediatamente aparece la alerta en rojo *"Debes ser mayor de 18 años para registrarte como responsable."* y el botón queda inhabilitado.
       - Ingresar una fecha de adulto (ej. `15/05/1990`): el error se despeja y se permite completar el registro.
     - `Teléfono` (`XX XXXX-XXXX` con máscara).
     - `Correo Electrónico *` (con validación y botón de borrado).
     - `Contraseña *` (mínimo 6 caracteres con visibilidad).
     - `Confirmar Contraseña *` (validación de coincidencia con contraseña).
3. **🔒 Autocontrol del Responsable: Ciclo de 4 Pasos (24 Horas):**
   - Iniciar el flujo de **Autocontrol con Doble Confirmación**.
   - **Paso 1 (Desactivar):** Presionar el botón *"Desactivar autoprotección"*.
   - **Paso 2 (Enfriamiento 24h):** Verificar que la protección **no** se apaga; el botón entra en espera indicando *"La desactivación se habilitará en 24 horas"* junto a la cuenta regresiva en vivo.
   - **Simulación Rápida:** Presionar el botón auxiliar `⏩ Simular +24h` para adelantar el reloj 24 horas instantáneamente.
   - **Paso 3 (Confirmación por 2do Clic):** Observar que el botón pasa a color verde con el texto *"Confirmar Desbloqueo (2do Clic)"*.
   - **Paso 4 (Pase Temporal 24h):** Hacer clic por segunda vez. La protección se desbloquea inmediatamente mostrando el estado de pase temporal (`TEMPORARILY_UNLOCKED`).
   - Al volver a pulsar `⏩ Simular +24h`, se comprueba la **auto-reactivación automática** regresando al estado bloqueado (`ACTIVE`).
4. **🚫 Gestión CRUD de Sitios Web Bloqueados Personalizados:**
   - En el Dashboard del Responsable, localizar la tarjeta *"Sitios Web Bloqueados"*.
   - **Agregar Sitio:** Presionar `+ Bloquear Sitio`. En la ventana modal, ingresar un dominio (ej. `tiktok.com`, `instagram.com` o `sitio-ejemplo.bet`), elegir una categoría temática (`Redes Sociales`, `Apuestas`, etc.) y notas opcionales. Guardar y verificar su inclusión inmediata en la lista y en la consola de red (`POST /api/blocklist/custom/domains`).
   - **Buscador en Vivo:** Escribir en la barra de búsqueda para filtrar la lista al instante.
   - **Pausar / Reactivar Bloqueo:** Alternar el switch de estado (`isActive`) para pausar transitoriamente el bloqueo de un dominio sin borrarlo.
   - **Editar Sitio:** Pulsar el ícono de edición (✏️) para ajustar la categoría o notas.
   - **Eliminar Sitio:** Pulsar el ícono de papelera (🗑️) y confirmar en el diálogo preventivo.
   - **Comprobación de Interceptación:** En el selector de navegación, probar ingresar el dominio agregado para verificar que es bloqueado en tiempo real.
5. **📱 Límite de 5 Dispositivos por Responsable:**
   - Ver el indicador de capacidad `(X/5) Dispositivos`.
   - Generar códigos de pareamiento de 6 dígitos. Si se intentan agregar más de 5 dispositivos, el sistema bloquea la acción.
6. **🛡️ Solicitud y Auditoría de Permisos del Dispositivo:**
   - Probar la pantalla de solicitud de los 4 permisos de Android (`Servicio VPN`, `Accesibilidad Antidesinstalación`, `Notificaciones` y `Exención de Batería`).
   - Si se continúa con permisos pendientes, verificar la caja de alerta amarilla en la parte superior del dispositivo protegido.
   - En el Panel del Responsable, desplegar *"Ver Detalle"* para auditar el cumplimiento individual de permisos de cada hijo.
7. **📱 Modo Dispositivo Protegido (Hijo / Menor / Adulto):**
   - Pausar o reanudar el motor local de protección VPN ingresando el **PIN del tutor (`1234`)**.
   - **Simulador de Interceptación LOTBA:** Seleccionar un dominio clandestino (ej. `apuestas-online-ilegal.bet`, `casino-sin-licencia.com`) y pulsar *"Simular Intento de Navegación"*. La app interceptará la solicitud, mostrará la alerta roja de bloqueo y enviará el evento en tiempo real al backend.
   - Observar el envío periódico de **Heartbeats** de telemetría.
8. **Consola de Red en Tiempo Real:**
   - La barra lateral izquierda muestra el flujo en vivo de solicitudes HTTP (`GET`, `POST`, `PUT`, `DELETE`, `BLOCK`).

---

### 🧪 Ejecución de la Suite de Pruebas Automatizadas

Para validar que todo el código cumple con las especificaciones y pruebas de regresión:

#### Tests del Backend (API REST, Blocklist CRUD, Permisos, Auth):
```bash
cd backend
npm test
```
*Cobertura: 21 tests de integración que validan endpoints REST, sanitización de dominios, auditoría y control de errores.*

#### Tests del Frontend (Onboarding Wizard 3 Pasos, Autocontrol 4 Pasos, Validación de Edad +18, Blocklist CRUD):
```bash
cd frontend
npm test
```
*Cobertura: 39 tests unitarios y de interfaz que validan el Wizard de 3 pantallas y video optativo de onboarding, el cálculo de mayoría de edad, la máquina de estados de autocontrol y la interacción de la lista de bloqueo.*

---

## 🗄️ Configuración con Base de Datos Real (PostgreSQL 18 / Supabase) y Railway

Cuando se desee utilizar una base de datos PostgreSQL real (local o Supabase):

1. Configurar el archivo `backend/.env` (ver plantilla en `backend/.env.example`):
   ```env
   USE_MOCK_DATA=false
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/baprotege_db?schema=public"
   DIRECT_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/baprotege_db?schema=public"
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

### ☁️ Despliegue en Producción (Railway)
El backend se encuentra desplegado en **Railway** con despliegue automático conectado a la rama `main` (directorio raíz `/backend`):
- **URL Base API (Producción):** `https://innova-lab-equipo-21-control-parental-ba-protege.up.railway.app/api`
- **Health Check:** `GET https://innova-lab-equipo-21-control-parental-ba-protege.up.railway.app/api/health`
- El cliente móvil (`frontend/src/services/api/client.ts`) apunta por defecto a esta URL HTTPS pública para que cualquier teléfono físico pueda registrarse e iniciar sesión (con correo o con Google) sin depender de un servidor local.

---

## 📦 Compilación de APK de Release y Distribución

Para generar una **APK de Release firmada** lista para distribuir e instalar en cualquier teléfono Android real (peso reducido a **~28 MB** con soporte para arquitecturas ARM `arm64-v8a` y `armeabi-v7a`, bundle Hermes embebido y modo `debuggable` desactivado):

1. **Configurar la clave de firma local (no versionada en Git):**
   - Copiar `frontend/android/keystore.properties.example` a `frontend/android/keystore.properties` y completar los datos de la keystore local (`baprotege-release.keystore`).
   - Asegurarse de tener las huellas digitales **SHA-1** y **SHA-256** del certificado de release registradas en **Firebase Console** y el archivo `frontend/android/app/google-services.json` actualizado (necesario para **Google Sign-In**).
2. **Compilar la APK de Release:**
   ```bash
   cd frontend
   npm run build:apk:release
   ```
   - La APK firmada se genera en `frontend/android/app/build/outputs/apk/release/app-release.apk` y se copia automáticamente a `frontend/landing/assets/apk/ba-protege-release.apk`.
3. **Instalación en celular físico:**
   - Si el teléfono ya tenía instalada una versión anterior compilada en modo `debug`, desinstalarla una única vez antes de instalar la APK de `release` (ya que cambia la firma digital).

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
