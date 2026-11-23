# BA Protege+ — Frontend Mobile Android

<!--
==============================================================================
Proyecto: BA Protege+
Componente: Frontend Mobile Android (React Native + Kotlin)
Archivo: frontend/README.md
Descripción: Documentación técnica completa, guía de instalación, Kit UI/UX,
             Flujo de Acceso Inteligente (Primer Acceso del Responsable),
             Panel Ejecutivo de Actividad con Datos Reales y Alto Contraste
             Cognitivo (LOTBA Azul vs. Personalizada Ámbar), Persistencia de
             Período (Hoy por defecto), Destaque de Hoy en Gráficos,
             Identificación de Origen (Adulto Protegido -> Responsable),
             Dashboards Diferenciados para Protegido Adulto y Menor (Pasatiempos
             con Quiz, Sopa de Letras y Memoria de 12 piezas), Mascotas Boti y
             Botito con Sentimientos Dinámicos y Suite de 142 Pruebas.
==============================================================================
-->

Aplicación móvil desarrollada en **React Native 0.87 + TypeScript** con un **Kit UI/UX del Sistema de Diseño oficial**, **Flujo Ordenado de Acceso con detección de Primer Ingreso del Responsable (`responsibleFirstAccess.ts`)**, pantalla de **Selección de Modo optimizada sin scroll**, arquitectura de **Autenticación Modular (`src/components/auth/`)** con **Modales Bottom Sheet Legales (`TermsModal` / `PrivacyModal`)** y selector de fecha (`DatePickerModal`), **Ingreso con Google (`logo_google.png`)**, **Gestión y Auditoría de 6 Permisos Android (`PermissionsScreen.tsx`)** con activación unidireccional en modos protegidos, **Navegación de 5 Pestañas en Modo Responsable (`DashboardNavbar.tsx`)**, **Panel Ejecutivo de Actividad con Datos Reales (`src/components/dashboard/actividad/`)** con visualización de alto contraste cognitivo, persistencia de período en `AsyncStorage`, destaque dinámico del día de hoy y anonimización de dominios LOTBA, **Trazabilidad de Origen de Bloqueos entre Adulto Protegido y Responsable**, **Dashboards Diferenciados de 4 Módulos para Protegido Adulto y Protegido Menor** (con pestaña **Pasatiempos**: *Quiz*, *Sopa de letras* y *Juego de la memoria de 12 piezas*), **Sistema de Mascotas Emocionales (`Beti`, `Boti` y `Botito`)**, **Autoprotección del Responsable con bloqueo obligatorio de 24hs**, gestión de **hasta 5 dispositivos vinculados** (con deshabilitación del engranaje de configuración mientras el dispositivo esté inactivo), módulos nativos en **Kotlin 2.x** para filtrado local `VpnService`, **Capa de Servicios API Modularizada (`src/services/api/`)** y **Suite Automatizada de 142 Tests (31 suites)**.

---

## 📌 Tabla de Contenidos

1. [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
2. [Flujo Ordenado de Acceso y "Elegir protección"](#-flujo-ordenado-de-acceso-y-elegir-protección)
3. [Reglas de Negocio Implementadas](#-reglas-de-negocio-implementadas)
4. [Sistema de Diseño, Mascotas Emocionales y Kit UI/UX](#-sistema-de-diseño-mascotas-emocionales-y-kit-uiux)
5. [Home y Panel Ejecutivo de Actividad (Modo Responsable)](#-home-y-panel-ejecutivo-de-actividad-modo-responsable)
6. [Gestión de Sitios y Apps + Trazabilidad de Origen](#-gestión-de-sitios-y-apps--trazabilidad-de-origen)
7. [Dashboards Diferenciados: Modo Protegido Adulto vs. Modo Menor](#-dashboards-diferenciados-modo-protegido-adulto-vs-modo-menor)
8. [Pestaña de Cuenta Unificada por Rol](#-pestaña-de-cuenta-unificada-por-rol)
9. [Actualizaciones Recientes y Avances Técnicos](#-actualizaciones-recientes-y-avances-técnicos)
10. [Estructura del Proyecto](#-estructura-del-proyecto)
11. [Guía de Instalación y Pruebas con APK](#-guía-de-instalación-y-pruebas-con-apk)

---

## 🛠️ Tecnologías y Arquitectura

- **Framework Móvil:** React Native 0.87 (TypeScript estricto)
- **Sistema de Diseño:** Kit UI/UX oficial (`src/theme/` y `src/components/`)
- **Compilación Android:** Gradle + Android Studio (Emulador o Celular Físico)
- **Capa Nativa Android:** Kotlin 2.x / Android SDK Platform 35/37 (Java 17)
- **Motor de Filtrado:** `android.net.VpnService` local con caché offline
- **Anti-Bypass & Resiliencia:** `BootReceiver` (`RECEIVE_BOOT_COMPLETED`) y validación de tiempo confiable (`getReliableTimestamp()`)
- **Servicios en Primer Plano:** `NotificationManager` con canal persistente de seguridad
- **Puente Nativo:** `ProtectionModule` (`ReactContextBaseJavaModule`)
- **Capa de Servicios API:** Modularizada en `src/services/api/` (`auth`, `devices`, `blocklist`, `selfControl`, `telemetry`) con cliente configurado hacia la API en producción en **Railway** (`https://innova-lab-equipo-21-control-parental-ba-protege.up.railway.app/api`), fachada unificada `apiService` y soporte híbrido online/offline (`safeStorage`)
- **Autenticación con Google & Firebase:** Integración nativa con `@react-native-google-signin/google-signin` (`src/services/googleAuth.service.ts`) sincronizada con `google-services.json` (huellas SHA-1/SHA-256 de debug y release)
- **Compilación Release Optimizada:** Firma digital vía `android/keystore.properties`, filtro de arquitecturas ARM (`arm64-v8a`, `armeabi-v7a`) en release (~28 MB) y copia automática hacia `landing/assets/apk/ba-protege-release.apk`
- **Persistencia Local:** `@react-native-async-storage/async-storage` para sesiones, preferencias y períodos de analítica
- **Testing Automatizado:** Node Test Runner + `tsx` (`142 tests` distribuidos en `31 suites` y `18` archivos de prueba)

---

## 🔄 Flujo Ordenado de Acceso y "Elegir proteção"

La aplicación estructura su navegación desde `src/App.tsx` adaptándose al perfil elegido y recordando si el Responsable ya realizó su configuración inicial:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 1: SPLASH ANIMADO + ONBOARDING WIZARD DE 3 PANTALLAS            │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 2: SELECCIÓN DE MODO OPERATIVO (WelcomeScreen — Sin scroll)     │
│ - Modo Responsable (Escudo) vs. Modo Protegido (Corazón)             │
└──────────────────┬─────────────────────────────────┬─────────────────┘
                   │                                 │
                   ▼                                 ▼
┌───────────────────────────────────┐   ┌──────────────────────────────┐
│ PASO 3A: MODO RESPONSABLE         │   │ PASO 3B: MODO PROTEGIDO      │
│ - Crear Cuenta (+18) / Login      │   │ - Código 123456 (Menor)      │
│ - Google Auth / Términos          │   │ - Código 654321 (Adulto)     │
└──────────────────┬────────────────┘   └──────────────┬───────────────┘
                   │                                   │
                   └─────────────────┬─────────────────┘
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│ PASO 4: PERMISOS DEL DISPOSITIVO ANDROID (PermissionsScreen)         │
│ - 6 permisos clave auditados en tiempo real                          │
│ - En modos protegidos: solo permite activar, nunca desactivar        │
└──────────────────┬─────────────────────────────────┬─────────────────┘
                   │ (Responsable)                   │ (Protegido)
                   ▼                                 ▼
┌───────────────────────────────────┐   ┌──────────────────────────────┐
│ PASO 4.1: "ELEGIR PROTECCIÓN"     │   │ PASO 5B: DASHBOARD PROTEGIDO │
│ (Solo en el 1er acceso del usuario│   │ - Adulto: Inicio, Sitios y   │
│  Responsable)                     │   │   apps, Actividad, Cuenta    │
│ • Vincular dispositivo -> Modal   │   │ - Menor: Inicio, Pasatiempos,│
│   "Vincular nuevo dispositivo"    │   │   Actividad, Cuenta          │
│   -> Guarda -> Va directo a Home  │   └──────────────────────────────┘
│ • Configurar este dispositivo ->  │
│   Va a "Sitios y apps" (lista     │
│   vacía con aviso) -> Activa      │
│   Autoprotección -> Va a Home     │
└──────────────────┬────────────────┘
                   ▼
┌───────────────────────────────────┐
│ PASO 5A: DASHBOARD RESPONSABLE    │
│ 5 Pestañas: Inicio, Dispositivos, │
│ Sitios y apps, Actividad, Cuenta  │
└───────────────────────────────────┘
```

---

## 📜 Reglas de Negocio Implementadas

1. **Pantalla "Elegir protección" exclusiva del Primer Acceso (`responsibleFirstAccess.ts`):**
   - Se presenta únicamente la primera vez que cada usuario Responsable accede a la app (persistido por correo normalizado o ID). En inicios de sesión posteriores pasa directamente a **Inicio (Home)**.
   - **Vincular dispositivo:** abre el modal `"Vincular nuevo dispositivo"` (`PairingModal.tsx`) y, una vez guardado el dispositivo, redirige directo a **Inicio (Home)**.
   - **Configurar este dispositivo:** dirige a **Sitios y apps**, que inicia con lista vacía (`0` sitios y `0` apps) mostrando un aviso claro de que primero debe agregarse al menos un sitio o app con el botón `+` para habilitar **Autoprotección**. Al activar **Autoprotección**, redirige automáticamente a **Inicio (Home)**.
2. **Límite y Estado de Dispositivos Protegidos:**
   - Un Responsable puede vincular hasta **5 dispositivos protegidos** (`MAX_PROTECTED_DEVICES = 5`). Al alcanzar el tope, el botón `+` de adición se oculta automáticamente.
   - **Control de Configuración en Dispositivos Inactivos:** El ícono de engranaje en [`DeviceCard.tsx`](src/components/dashboard/dispositivos/DeviceCard.tsx) solo está activo cuando la vinculación está activa. Mientras el dispositivo permanezca inactivo (pendiente de ingresar código), el ícono se presenta visualmente atenuado (opacidad al 35%) y sin interactividad.
3. **Autoprotección / Autocontrol del Responsable con Compromiso de 24 Horas:**
   - Doble confirmación guiada (`AutocontrolConfirmationModal.tsx`).
   - **Requisito mínimo:** Deshabilitada mientras existan `0` sitios y `0` apps en la lista personalizada; se habilita al registrar al menos un elemento.
   - **Inviolabilidad de bloqueos (24hs):** Durante las primeras **24 horas** (`ACTIVE_LOCKED`) tras activarse, no se permite desactivar la autoprotección ni pausar/eliminar reglas aplicadas al dispositivo del responsable.
   - **Reinicio limpio:** Cumplidas las 24 horas (`DEACTIVATION_READY`), puede desactivarse manualmente; al reactivar, el ciclo de 24 horas comienza nuevamente desde cero.
4. **Permisos Android Unidireccionales en Modos Protegidos (`permissionChecker.ts`):**
   - Supervisión de los **6 permisos clave** (*Servicio VPN*, *Accesibilidad*, *Notificaciones*, *Sin optimización de batería*, *Ubicación* y *Acceso al uso*).
   - Tanto el **Adulto Protegido** como el **Menor** pueden conceder permisos pendientes desde su alerta `DISPOSITIVO NO PROTEGIDO`, pero **nunca desactivarlos**.
5. **Trazabilidad de Bloqueos del Adulto Protegido:**
   - Todo sitio o aplicación bloqueado voluntariamente por un **Adulto Protegido** queda registrado con metadatos de autoría (`ADULTO_PROTEGIDO`), es **permanente para el protegido** (solo el Responsable puede editarlo, pausarlo o eliminarlo) y se identifica visualmente en el panel del Responsable.
6. **Juegos Educativos de Uso Único Diario en Modo Menor (`pasatiempos.ts`):**
   - Cuando el menor completa un juego (*Quiz*, *Sopa de letras* o *Juego de la memoria*), no tiene opción de volver a jugarlo: pasa automáticamente al final de la lista en estado **Completado / Inactivo**, promoviendo el descanso de pantallas al finalizar los 3 desafíos.

---

## 🎨 Sistema de Diseño, Mascotas Emocionales y Kit UI/UX

### 1. Tokens de Color Oficiales (`src/theme/colors.ts` & `palette.ts`)
- **Primary (`#007AFF`):** Acciones principales, encabezados institucionales y enlaces del sistema.
- **Header Institucional (`#EAF3FF`) & Active Tab (`#E5F1FF`):** Cabecera superior con `logo_baprotege_texto.png` y destaque de pestaña activa en barras de navegación.
- **Alto Contraste Cognitivo en Actividad (`analyticsPalette`):**
  - **Fuente LOTBA (Azul institucional `#0284C7`):** Bloqueos preestablecidos de la lista oficial.
  - **Fuente Personalizada (Ámbar cálido `#F59E0B`):** Bloqueos específicos configurados por el tutor o adulto protegido.
  - **Separador blanco accesible:** Corte de 3px entre segmentos para garantizar accesibilidad cognitiva y visual según WCAG AAA.
- **Secondary / Success (`#28A745`):** Protección activa, permisos concedidos y juegos completados.
- **Warning (`#D97706` / `#FEF3C7`):** Avisos de permisos pendientes (`DISPOSITIVO NO PROTEGIDO`) y requisitos previos de autoprotección.
- **Danger (`#DC3545`):** Bloqueos críticos, alertas para menores y acciones destructivas.

### 2. Mascotas Oficiales por Perfil y Sentimiento (`botMascots.ts` & `botAssets.ts`)
Cada rol cuenta con su propio asistente visual y expresiones emocionales adaptadas al mensaje de cada pantalla o modal:
- **Beti (`beti.png`):** Asistente institucional del **Tutor Responsable**.
- **Boti (`src/assets/icons/bot/adulto/boti_*.png`):** Compañero del **Modo Protegido Adulto** en 4 estados emocionales:
  - `feliz` (éxito, protección activa, puntaje alto en Quiz ≥ 80%).
  - `pensando` (preguntas del Quiz, búsqueda, información y configuración).
  - `nervioso` (advertencias de bloqueo irreversible, permisos pendientes, puntaje medio).
  - `triste` (intentos de desbloqueo restringidos, errores o puntaje bajo < 40%).
- **Botito (`src/assets/icons/bot/menor/botito_*.png`):** Compañero amigable del **Modo Protegido Menor** con los mismos 4 sentimientos (`feliz`, `pensando`, `nervioso`, `triste`) aplicados en *Inicio*, *Pasatiempos*, *Quiz*, *Sopa de letras*, *Juego de la memoria* y modales de feedback.

### 3. Botón Flotante con Tooltip Auto-Ocultable (`FabWithTooltip.tsx`)
- Bocadillo contextual (*"Bloquear sitio o app"*, *"Nuevo dispositivo"*) que se oculta automáticamente tras **3 segundos** para mantener limpia la interfaz.

---

## 📊 Home y Panel Ejecutivo de Actividad (Modo Responsable)

### 1. Home Compacta del Responsable (`ParentInicioSection.tsx`)
Diseñada para visualizar el estado general sin necesidad de scroll:
- **Saludo personalizado** según franja horaria + primer nombre.
- **Card dinámico de estado:** `ESTÁS PROTEGIDO` (azul) o `DISPOSITIVO NO PROTEGIDO` (ámbar con conteo de permisos pendientes y acceso directo por `engrenaje.png`).
- **Card de Dispositivos protegidos:** Resumen limpio `X protegidos • Y inactivos` en la esquina superior derecha, fila de avatares ordenados A-Z, badge `"Yo"` al final cuando la autoprotección está activa y botón `+ Nuevo dispositivo` (si hay menos de 5 vinculados).
- **Cards simétricos de Sitios y Apps bloqueados** con acceso directo a cada sub-pestaña.
- **Gráfico histórico compacto** de intentos interceptados + enlace a **Preguntas frecuentes**.

### 2. Panel Ejecutivo de Actividad con Datos Reales (`src/components/dashboard/actividad/`)
Arquitectura desacoplada y modular orquestada por [`AnalyticsPanel.tsx`](src/components/dashboard/actividad/AnalyticsPanel.tsx) con soporte para datos de demostración o datos reales en vivo a través de [`useRealAnalyticsData.ts`](src/components/dashboard/actividad/useRealAnalyticsData.ts):
1. **Cabecera Institucional Estilizada:** Con botón volver y selector desplegable de período (`PeriodSelector.tsx`).
2. **Filtro de Período con Persistencia:** Inicia siempre en **Hoy** (`today`) en el primer acceso y persiste las elecciones del usuario en `AsyncStorage` (`@ba_protege_actividad_period`). Opciones ordenadas según diseño oficial: *Hoy*, *Esta semana*, *Este mes*.
3. **Fila de Dispositivos Protegidos:** Chips horizontales (`DeviceChipsRow.tsx`) con dot de estado de salud, filtro por dispositivo individual o agregado general (`Todos`), con etiqueta `"Yo"` para el tutor.
4. **Alerta de Conectividad (Heartbeat):** Banner inteligente (`HeartbeatBanner.tsx`) que advierte cuando un dispositivo vinculado dejó de reportar o tiene vinculación pendiente.
5. **Bloqueos Totales y Desglose:** Tarjeta ejecutiva (`TotalBlocksCard.tsx`) con el total de intentos frenados, porcentaje de continuidad de protección (uptime) y distribución porcentual por dispositivo.
6. **Bloqueos por Fuente y Gráfico Integrado:** Tarjeta unificada (`BlocksBySourceCard.tsx` + `ActivityChartCard.tsx`) que detalla la proporción entre **Lista LOTBA** y **Personalizada** e integra directamente el gráfico interactivo apilado (`StackedBarChart.tsx`):
   - **Alternancia entre "Por día (Sem)" y "Franja horaria":** Mediante pestañas segmentadas.
   - **Destaque Continuo del Día de Hoy:** La barra correspondiente al día de hoy en la vista semanal cuenta con corona superior **HOY**, borde institucional azul (`stackToday`), opacidad plena y destaque en el eje X. En la vista horaria, la barra de la hora actual recibe la corona **HOY** y el selector de días de la semana marca visualmente la jornada presente.
   - **Inspector Sin Abreviaciones Ambiguas:** Muestra detalle de intentos por franja (ej. `Jueves (5 a 6 h): 9 intentos`) excluyendo la sigla `"int."`.
7. **Listado de Bloqueos y Auditoría de Seguridad:** Pestañas de auditoría (`AuditEventsCard.tsx`) para consultar los últimos bloqueos y los eventos anti-bypass. Los dominios provenientes de la lista oficial de LOTBA se **anonimizan** automáticamente (ej. `apuestas-***.bet`) para preservar el secreto legal de la nómina.

---

## 🌐 Gestión de Sitios y Apps + Trazabilidad de Origen

Módulo ubicado en `src/components/dashboard/sitios/` con hooks desacoplados (`useSitesManagement.ts` y `useAppsManagement.ts`):
- **Sub-pestañas `🌐 Sitios web` y `📱 Aplicaciones`:** CRUD completo, normalización de dominios, sugerencias rápidas de apps populares y límites diarios por dispositivo.
- **Toggle de Autoprotección + Aviso de Lista Vacía:** Incluye interruptor superior y banner informativo cuando aún no hay sitios ni apps cargados.
- **Identificador de Origen (`ADULTO_PROTEGIDO` vs. `RESPONSABLE`):**
  - Las tarjetas en `SitesTab.tsx` y `AppsTab.tsx` exhiben una etiqueta distintiva cuando el bloqueo fue agregado por un **Adulto protegido** (incluyendo su nombre/dispositivo).
  - El menú de 3 puntos (`SitesAppsOptionsMenuModal.tsx`) incorpora **Filtro rápido por origen** (`Todos`, `Responsable`, `Adulto protegido`), además de filtro por dispositivo, búsqueda, ordenamiento (`Recientes` / `A-Z`) y selección múltiple en lote.

---

## 🛡️ Dashboards Diferenciados: Modo Protegido Adulto vs. Modo Menor

`ProtectedDeviceScreen.tsx` adapta completamente la navegación, mascota, reglas y pantallas según el perfil vinculado:

### A. Modo Protegido Adulto (`src/components/dashboard/protected/adulto/`)
Barra inferior de 4 pestañas (`AdultoNavbar.tsx`): **`Inicio` · `Sitios y apps` · `Actividad` · `Cuenta`**
1. **`AdultoInicioSection.tsx`:** Réplica adaptada de la Home con saludo, bloque `DISPOSITIVO NO PROTEGIDO` (permisos), card de **Quiz diario con Boti** (una vez completado muestra puntaje y consejo saludable sin permitir repetirlo en el día), contadores de **Sitios** y **Apps** bloqueados con CTA `Ver`, resumen **Tiempo de uso de mis apps** y enlace a **Preguntas frecuentes**.
2. **`AdultoSitiosSection.tsx`:** Permite consultar elementos bloqueados, **buscar** y **ordenar** (`AdultoSitiosOptionsModal.tsx`) e **incluir nuevos sitios o apps** (`AdultoAddSiteModal.tsx`, `AdultoAddAppModal.tsx`) con advertencia previa con **Boti nervioso** explicando que solo el Responsable podrá desactivarlos o eliminarlos. No incluye Autoprotección ni opciones de edición/borrado.
3. **`AdultoActividadSection.tsx`:** Detalle diario de tiempo en pantalla por aplicación y hábitos digitales saludables.
4. **`AdultoCuentaSection.tsx`:** Perfil protegido (solo lectura), acceso a Permisos, Ayuda y soporte, Información legal y Cerrar sesión.

### B. Modo Protegido Menor (`src/components/dashboard/protected/menor/` y `juegos/`)
Barra inferior diferenciada de 4 pestañas (`MenorNavbar.tsx`): **`Inicio` · `Pasatiempos` · `Actividad` · `Cuenta`**
1. **`MenorInicioSection.tsx`:** Saludo dinámico, bloque `DISPOSITIVO NO PROTEGIDO`, **card dinámico de juego pendiente con Botito** (ofrece secuencialmente *Quiz* → *Sopa de letras* → *Juego de la memoria*, salteando los ya completados; al completar los 3 invita a salir con amigos o realizar actividades sin pantallas), banner preventivo *"SI SOS MENOR NO PODÉS INGRESAR A SITIOS DE APUESTAS"*, **Tiempo de uso de mis apps** y **Preguntas frecuentes**.
2. **`MenorPasatiemposSection.tsx` (`Pasatiempos`):**
   - Cabecera institucional con botón **Volver** hacia `Inicio`, título **"Pasatiempos"** y contador `X/3 completados`.
   - **3 Juegos Educativos (`src/components/dashboard/protected/juegos/`):**
     - **`QuizModal.tsx`:** Preguntas interactivas sobre seguridad digital y hábitos saludables con **Botito**.
     - **`WordSearchModal.tsx`:** **Sopa de letras** interactiva con tableros validados sin colisiones y selección por línea recta.
     - **`MemoryGameModal.tsx`:** **Juego de la memoria de 12 piezas (6 pares)** temáticos con contador de movimientos y festejo final con **Botito feliz**.
   - Todo juego completado queda **inactivo** (sin opción de rejugar) y se desplaza automáticamente al **final de la lista**.
3. **`MenorActividadSection.tsx` & `MenorCuentaSection.tsx`:** Visualización clara del tiempo de uso diario y pestaña Cuenta adaptada sin opciones administrativas del Responsable.

---

## 👤 Pestaña de Cuenta Unificada por Rol

- **En Modo Responsable (`src/components/dashboard/cuenta/`):** Incluye `ProfileSection` (Editar perfil + Vincular Google), `GlobalRulesSection` (Bloqueo LOTBA, Alertas, Antidesinstalación, Autoprotección, Permisos), `HelpSection` (Tutorial Onboarding y FAQ), `LegalSection` (Términos, Privacidad y `RatingModal` de evaluación), **Zona de Peligro** (Eliminar cuenta) y Cerrar sesión.
- **En Modos Protegidos Adulto y Menor (`AdultoCuentaSection.tsx` / `MenorCuentaSection.tsx`):** Replica el diseño institucional del Responsable conservando Perfil identificatorio, `GlobalRulesSection` adaptado (Bloqueo obligatorio LOTBA, Antidesinstalación protegida con OTP de 6 dígitos enviado al correo del responsable y Permisos), Ayuda y soporte, Información legal/evaluación, Cerrar sesión y versión oficial, **excluyendo estrictamente**: *Autoprotección*, *Editar Perfil*, *Vincular Google* y *Zona de Peligro*.

---

## ✨ Actualizaciones Recientes y Avances Técnicos

1. **Nuevo Módulo de Actividad (`src/components/dashboard/actividad/`)**: Integración completa de la Propuesta Superadora de analítica con Alto Contraste Cognitivo (Azul LOTBA vs. Ámbar Personalizada), arquitectura modular (`atomic/`, `blocks/`, `hooks/`), anonimización de URLs de LOTBA, y orquestación con datos reales vía `useRealAnalyticsData.ts`.
2. **Persistencia de Filtro de Período y Destaque de «Hoy»**: Apertura inicial obligatoria en **Hoy** con persistencia en `AsyncStorage` (`@ba_protege_actividad_period`). Destaque visual continuo de la barra de hoy (corona `HOY`, borde institucional y opacidad plena) en las vistas diaria y horaria, eliminando la sigla ambigua `"int."`.
3. **Protección de Configuración en Dispositivos Inactivos (`DeviceCard.tsx`)**: Deshabilitación condicional del ícono de engranaje (opacidad 35%, no clickeable) mientras la vinculación no haya sido completada por el dispositivo protegido.
4. **Mascotas Emocionales `Boti` y `Botito` (`botMascots.ts` + `botAssets.ts`)**: 8 ilustraciones PNG dedicadas (`feliz`, `pensando`, `nervioso`, `triste`) asignadas contextualmente en pantallas, juegos y modales.
5. **Réplicas Adaptadas de Home y Cuenta para Adulto y Menor**: Consistencia visual de extremo a extremo entre los 3 perfiles operativos respetando permisos y restricciones por rol.
6. **Pasatiempos con Juego de la Memoria de 12 Piezas e Inactivación Post-Victoria**: Reemplazo del antiguo rompecabezas por `MemoryGameModal.tsx` (6 pares / 12 cartas) y ordenamiento dinámico de juegos completados al final de la lista.
7. **Metadatos de Origen + Filtro en Sitios y Apps**: Sincronización de bloqueos creados por Adulto Protegido hacia la lista del Responsable con identificador visual y filtro dedicado.
8. **Reglas Globales y Desactivación de Antidesinstalación Protegida con OTP (`AntiUninstallCodeModal.tsx`)**: Código de 6 dígitos con correo enmascarado del responsable para desactivar Antidesinstalación, con invalidación automática al cerrar.
9. **Producción en Railway + Google Sign-In Nativo + APK de Release (~28 MB)**:
   - Cliente HTTP (`src/services/api/client.ts`) apuntando al backend HTTPS en **Railway**, habilitando registro y login desde cualquier celular físico sin depender de red local.
   - `googleAuth.service.ts` actualizado con el Web Client ID oficial del proyecto Firebase, selector limpio de cuenta y sincronización del token tras vincular Google en Cuenta.
   - Configuración de firma de release (`keystore.properties.example`), filtro ABI (`arm64-v8a`, `armeabi-v7a`) que reduce la APK de ~113 MB a **~28 MB**, registro de huellas SHA-1/SHA-256 de debug y release en `google-services.json` y script `npm run build:apk:release`.
10. **Crecimiento de la Suite de Pruebas**: Expansión a **142 tests automatizados en 31 suites**, garantizando cobertura integral en métricas, persistencia, flujos de vinculación, permisos y reglas de seguridad.

---

## 📁 Estructura del Proyecto

A continuación se detalla la arquitectura modular del frontend organizada por dominios de responsabilidad:

```text
frontend/
├── android/                                      # Proyecto nativo Android (Gradle, Kotlin, VpnService, ProtectionModule)
│   ├── app/google-services.json                  # Configuración Firebase (clientes OAuth debug + release y Web Client ID)
│   └── keystore.properties.example               # Plantilla para configuración local de firma de release
├── src/
│   ├── assets/                                   # Recursos gráficos oficiales
│   │   ├── icons/                                # Íconos vectoriales y PNG (UI, navbar, escudo, engrenaje, etc.)
│   │   │   └── bot/                              # Mascotas oficiales: Beti (Tutor), Boti (Adulto) y Botito (Menor)
│   │   └── logo/                                 # Logotipos institucionales (BA, BA Protege+, Google)
│   ├── components/                               # Componentes visuales desacoplados
│   │   ├── auth/                                 # Módulos de autenticación, términos y date picker
│   │   ├── dashboard/                            # Vistas y paneles principales del sistema
│   │   │   ├── inicio/                           # Home compacta del Tutor Responsable
│   │   │   ├── dispositivos/                     # Gestión y tarjetas de dispositivos (PairingModal, Autocontrol)
│   │   │   ├── sitios/                           # Administración de sitios y apps (bloqueos y filtros de origen)
│   │   │   ├── actividad/                        # Panel de Analítica y Actividad (Propuesta Superadora MVP)
│   │   │   │   ├── atomic/                       # Primitivas gráficas (StackedBarChart, PillChip, SegmentedTabs)
│   │   │   │   ├── blocks/                       # Bloques de alto nivel (KPIs, desglose, auditoría, selector de período)
│   │   │   │   ├── hooks/                        # Lógica de analítica y persistencia (useAnalyticsPanel)
│   │   │   │   └── useRealAnalyticsData.ts       # Mapeo de eventos reales y telemetría hacia el modelo visual
│   │   │   ├── cuenta/                           # Ajustes del responsable (perfil, reglas globales, soporte, legal)
│   │   │   └── protected/                        # Dashboards dedicados para dispositivos vinculados
│   │   │       ├── adulto/                       # Dashboard adaptado para Modo Adulto Protegido
│   │   │       ├── menor/                        # Dashboard lúdico para Modo Menor Protegido
│   │   │       └── juegos/                       # Juegos educativos (Quiz, Sopa de Letras, Memoria 12 piezas)
│   │   └── [UI Común]                            # Botones, cabecera #EAF3FF, switches, badges y modales reutilizables
│   ├── data/                                     # Contenidos estáticos y guiones de tutoriales de onboarding
│   ├── screens/                                  # Pantallas y orquestadores principales del ciclo de vida
│   ├── services/                                 # Capa de integración y servicios de backend
│   │   ├── api/                                  # Módulos de API tipados (auth, devices, blocklist, telemetry, client)
│   │   ├── api.service.ts                        # Fachada unificada de comunicación con el backend
│   │   ├── googleAuth.service.ts                 # Autenticación nativa con Google Sign-In
│   │   └── protection.service.ts                 # Puente JS hacia el módulo nativo Android (VPN y permisos)
│   ├── theme/                                    # Tokens de diseño global (paleta de colores, tipografía, bordes)
│   ├── types/                                    # Contratos e interfaces TypeScript del dominio
│   └── utils/                                    # Lógica pura de negocio y funciones de utilidad
└── tests/                                        # Suite de 142 tests automatizados (31 suites en 18 archivos)
```

---

## ⚡ Guía de Instalación y Pruebas con APK

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Verificar Compilación de TypeScript (`0` errores)
```bash
npm run lint
```

### 3. Ejecutar la Suite Completa de Tests Automatizados (`142 tests / 31 suites`)
```bash
npm test
```

### 4. Compilar APK de Release (Recomendada para Celulares Físicos — ~28 MB)
1. Crear `frontend/android/keystore.properties` a partir de `frontend/android/keystore.properties.example` apuntando a la keystore de release local (`baprotege-release.keystore`, excluida de Git).
2. Ejecutar:
```bash
npm run build:apk:release
```
- Compila el bundle JS/Hermes automáticamente, filtra ABIs a `arm64-v8a` y `armeabi-v7a`, firma la APK en modo release (`debuggable = false`) y la genera en:
  - `android/app/build/outputs/apk/release/app-release.apk`
  - `landing/assets/apk/ba-protege-release.apk` *(copia automática)*
- **Nota:** Si el dispositivo tenía instalada previamente una versión `debug`, desinstalarla una única vez antes de instalar la versión `release`.

### 5. Compilar APK Debug (Emulador x86_64 y Desarrollo)
```bash
# 1. Generar el bundle JS estático (opcional para pruebas sin Metro)
npm run build:bundle

# 2. Compilar APK Debug
npm run build:apk
# Ubicación: android/app/build/outputs/apk/debug/app-debug.apk

# 3. Instalar y ejecutar en emulador o dispositivo conectado
npm run install:device
# O alternativamente:
npm run android
```
