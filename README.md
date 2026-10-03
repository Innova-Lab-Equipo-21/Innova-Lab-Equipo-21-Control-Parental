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
