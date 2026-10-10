# BA Protege+ — Backend API

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Backend API
Archivo: backend/README.md
Descripción: Documentación técnica, guía de instalación, configuración de base de
             datos (Supabase PostgreSQL), Firebase Admin y referencia de endpoints API REST.
==============================================================================
-->

Servidor backend desarrollado en **Node.js 24 (LTS) + Express + TypeScript**, con soporte de base de datos relacional **PostgreSQL 18 en la nube con Supabase** a través de **Prisma ORM**, integración con **Firebase Admin SDK** para servicios Cloud/Push, y **Modo de Datos Simulados (Mock Data)** en memoria para desarrollo ágil.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Instalación y Configuración](#-instalación-y-configuración)
4. [Integración con Supabase y Firebase](#-integración-con-supabase-y-firebase)
5. [Modos de Ejecución (Mock vs. Supabase PostgreSQL)](#-modos-de-ejecución-mock-vs-supabase-postgresql)
6. [Scripts Disponibles](#-scripts-disponibles)
7. [Referencia de Endpoints y Pruebas con cURL](#-referencia-de-endpoints-y-pruebas-con-curl)
8. [Datos de Prueba Precargados (Modo Mock)](#-datos-de-prueba-precargados-modo-mock)

---

## 🛠️ Tecnologías y Arquitectura

- **Runtime:** Node.js 24.20 LTS
- **Lenguaje:** TypeScript 5.7+
- **Framework Web:** Express 4.x / 5.x
- **ORM:** Prisma ORM 5.22+
- **Base de Datos Cloud:** PostgreSQL 18.6 alojado en **Supabase** (con soporte de Pooler PgBouncer)
- **Servicios Cloud / Push:** **Firebase Admin SDK** (`firebase-admin`)
- **Autenticación & Seguridad:** JWT (`jsonwebtoken`) + Hashing (`bcryptjs`) + `cors`
- **Validación de Esquemas:** Zod

---

## 📁 Estructura del Proyecto

```text
backend/
├── prisma/
│   ├── migrations/           # Historial de migraciones SQL aplicadas en PostgreSQL
│   └── schema.prisma         # Definición del esquema relacional PostgreSQL y modelos
├── src/
│   ├── config/
│   │   ├── database.ts       # Singleton del cliente Prisma y verificador de conexión
│   │   ├── environment.ts    # Validación de variables de entorno con Zod
│   │   ├── firebase.ts       # Módulo de inicialización del SDK de Firebase Admin
│   │   └── mock-database.ts  # Repositorio en memoria con datos de prueba realistas
│   ├── controllers/          # Manejadores HTTP para Auth, Dispositivos, Listas y Telemetría
│   ├── middlewares/          # Autenticación JWT, validación Zod y manejo centralizado de errores
│   ├── routes/               # Enrutamiento modular bajo el prefijo /api
│   ├── services/             # Lógica de negocio (Pairing, Heartbeat, Listas LOTBA)
│   ├── types/                # Definiciones de tipos e interfaces compartidas
│   ├── app.ts                # Configuración de Express y middlewares globales
│   └── server.ts             # Punto de entrada y arranque del servidor HTTP
├── tests/                    # Suite de pruebas automatizadas (Node.js Test Runner + tsx)
│   ├── health.test.ts        # Verificación de endpoint de salud y manejo 404
│   ├── auth.test.ts          # Pruebas de registro, validaciones Zod, login y recuperación
│   ├── blocklist.test.ts     # Pruebas de listas oficiales LOTBA y dominios personalizados
│   ├── device.test.ts        # Pruebas de códigos de pareamiento y vinculación
│   └── telemetry.test.ts     # Pruebas de latidos (heartbeats), estados y eventos de seguridad
├── .env                      # Variables de entorno activas (ignorado por Git)
├── .env.example              # Plantilla de variables de entorno
├── package.json              # Dependencias y scripts npm
└── tsconfig.json             # Configuración del compilador TypeScript
```

---

## ⚙️ Instalación y Configuración

### 1. Instalar dependencias
Desde la raíz del repositorio o dentro de la carpeta `backend`:
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
Copiar el archivo de plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```

Contenido del archivo `.env.example`:
```env
PORT=3000
NODE_ENV=development
USE_MOCK_DATA=false

# Conexión a Supabase mediante Transaction Pooler (PgBouncer en puerto 6543)
DATABASE_URL="postgresql://postgres.[REF_PROYECTO]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa a Supabase (puerto 5432) usada por Prisma para migraciones DDL
DIRECT_URL="postgresql://postgres.[REF_PROYECTO]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Clave de API de Firebase y credenciales Admin SDK
FIREBASE_API_KEY="AIzaSy..."
FIREBASE_PROJECT_ID="ba-protege-d304e"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@ba-protege-d304e.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Seguridad y Autenticación JWT
JWT_SECRET="clave_secreta_super_segura_para_desarrollo_ba_protege"
JWT_EXPIRES_IN="7d"

# Sincronización y telemetría (en minutos)
HEARTBEAT_TIMEOUT_MINUTES=5
```

---

## 🔥 Integración con Supabase y Firebase

### Base de Datos Supabase (PostgreSQL)
- **Pooler PgBouncer:** Configurado a través de `DATABASE_URL` para gestionar conexiones eficientes y concurrentes desde la API REST.
- **Migraciones DDL:** Prisma se conecta directamente a Supabase a través de `DIRECT_URL` para aplicar cambios estructurales en el esquema.
- **Modelos desplegados:** `users`, `devices`, `device_pairings`, `protection_configs`, `device_status`, `blocklists`, `blocklist_domains`, `blocked_events`, `security_events`, `audit_logs`.

### Firebase Admin SDK
- **Módulo de Configuración:** Ubicado en [`src/config/firebase.ts`](file:///home/juan/Documentos/Innova-Lab-Equipo-21-Control-Parental/backend/src/config/firebase.ts).
- **Credenciales:** Soporta carga dinámica mediante variables de entorno en `.env` o archivo de clave local no versionado.
- **Propósito:** Gestión de notificaciones push para eventos de seguridad y alertas de bloqueo en dispositivos móviles.

---

## 🔄 Modos de Ejecución (Mock vs. Supabase PostgreSQL)

### A. Modo Base de Datos Real en la Nube (`USE_MOCK_DATA=false`) [Configuración Activa]
- Conecta directamente a la instancia alojada en **Supabase**.
- Al iniciar el servidor (`npm run dev`), Prisma establece el pool de conexiones PgBouncer automáticamente.
- Aplicar migraciones o cambios de esquema:
  ```bash
  npx prisma migrate dev
  ```
- Generar el cliente de Prisma:
  ```bash
  npx prisma generate
  ```

### B. Modo de Datos Simulados (`USE_MOCK_DATA=true`)
- No requiere conexión a internet ni base de datos externa.
- Todos los endpoints de registro, login, dispositivos, pareamiento, listas y latidos funcionan en memoria con datos precargados.
- Ideal para pruebas offline o desarrollo rápido de componentes aislados.

---

## 🧪 Pruebas Automatizadas (Test Suite)

El backend cuenta con una suite integral de **19 pruebas automatizadas** distribuidas en 5 suites, ejecutadas con el test runner nativo de Node.js (`node:test` + `node:assert` + `tsx`) sin dependencias pesadas externas:

```bash
npm test
```

### Cobertura de Pruebas:
- **`health.test.ts`:** Estado operativo del servidor (`GET /api/health` ➜ 200 UP) y fallback global de rutas inexistentes (404).
- **`auth.test.ts`:** Validación estricta con Zod (rechazo de formatos incorrectos 422), registro exitoso de tutores con hash bcrypt, prevención de emails duplicados (409), autenticación con JWT (200), rechazo de credenciales inválidas (401) y recuperación de clave.
- **`blocklist.test.ts`:** Descarga de reglas oficiales de LOTBA con dominios de apuestas bloqueados, protección de rutas privadas mediante token Bearer (401), agregado de sitios prohibidos personalizados y eliminación por ID.
- **`device.test.ts`:** Emisión de código de pareamiento de 6 dígitos para el tutor responsable, validación de códigos incorrectos o expirados (400), vinculación efectiva del dispositivo del menor y listado en el panel.
- **`telemetry.test.ts`:** Recepción periódica de latidos (*heartbeat*) con cálculo dinámico de estado (`ACTIVE` o `INACTIVE`), registro de intentos de acceso a casinos no autorizados y detección de eventos de evasión (`VPN_DISABLED`).

---

## 📜 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor con recarga en caliente usando `tsx watch`. |
| `npm test` | Ejecuta la suite completa de 19 pruebas automatizadas con `tsx --test`. |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm run start` | Inicia el servidor compilado de producción (`node dist/server.js`). |
| `npm run lint` | Valida la coherencia de tipos con `tsc --noEmit`. |
| `npm run prisma:generate` | Regenera el cliente de Prisma basado en `schema.prisma`. |
| `npm run prisma:migrate` | Aplica migraciones pendientes a la base de datos PostgreSQL en Supabase. |
| `npm run prisma:studio` | Abre la interfaz visual de Prisma Studio para inspeccionar datos de Supabase. |

---

## 📡 Referencia de Endpoints y Pruebas con cURL

### 1. Verificación de Estado (Health Check)
```bash
curl http://localhost:3000/api/health
```
*Respuesta:*
```json
{
  "status": "UP",
  "project": "BA Protege+",
  "timestamp": "2026-09-11T16:47:31.722Z"
}
```

### 2. Registro de Usuario Responsable (Crear Cuenta)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "gender": "Masculino",
    "birthDate": "15/05/1984",
    "phone": "11 2345-6789",
    "email": "juan.perez@ejemplo.com",
    "password": "password123"
  }'
```
*Respuesta:* Retorna el objeto `user` con ID generado y el `token` JWT de sesión.

### 3. Autenticación de Responsable (Login)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tutor@baprotege.gob.ar\",\"password\":\"password123\"}"
```
*Respuesta:* Retorna el objeto `user` y el `token` JWT necesario para las rutas protegidas.

### 4. Recuperación de Contraseña
```bash
curl -X POST http://localhost:3000/api/auth/recover-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tutor@baprotege.gob.ar\"}"
```
*Respuesta:* Retorna confirmación del procesamiento de la solicitud de recuperación.

### 5. Listado de Dispositivos Vinculados (Requiere Token)
```bash
curl http://localhost:3000/api/devices \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```

### 6. Generación de Código de Pareamiento (6 Dígitos)
```bash
curl -X POST http://localhost:3000/api/devices/pair/generate \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```
*Respuesta:* Retorna un código numérico temporal (ej: `483921`) con validez de 15 minutos.

### 7. Consulta de Lista Oficial LOTBA
```bash
curl http://localhost:3000/api/blocklist/official
```
*Respuesta:* Retorna los dominios oficiales de apuestas no autorizadas con su número de versión.

### 8. Enviar Latido de Telemetría (Heartbeat)
```bash
curl -X POST http://localhost:3000/api/telemetry/heartbeat \
  -H "Content-Type: application/json" \
  -d "{\"deviceUuid\":\"uuid-samsung-mateo-a54\",\"vpnActive\":true,\"permissionsOk\":true,\"batteryLevel\":85,\"blocklistVersion\":4}"
```

### 9. Registrar Intento de Acceso Bloqueado
```bash
curl -X POST http://localhost:3000/api/telemetry/events/blocked \
  -H "Content-Type: application/json" \
  -d "{\"deviceUuid\":\"uuid-samsung-mateo-a54\",\"attemptedDomain\":\"apuestas-online-ilegal.bet\",\"sourceListType\":\"LOTBA\"}"
```

---

## 👥 Datos de Prueba Precargados (Modo Mock)

- **Usuario Responsable:**
  - Email: `tutor@baprotege.gob.ar`
  - Contraseña: `password123`
  - Nombre: Carlos Gutiérrez (Tutor)
- **Dispositivos Vinculados:**
  1. `Samsung Galaxy A54 (Mateo)` — Estado: **`ACTIVE`** (VPN encendida, 3 bloqueos previos).
  2. `Motorola Moto G84 (Sofía)` — Estado: **`ACTIVE`** (VPN encendida).
  3. `Xiaomi Redmi Note 13 (Lucas)` — Estado: **`PERMISSION_REQUIRED`** (VPN apagada por permiso revocado).
- **Código de Pareamiento Inicial Activo:** `483921`
