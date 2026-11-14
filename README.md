# SOLVIX — Plataforma de Gestión de Tickets de Soporte Técnico

> **"Soluciones rápidas y eficientes"**  
> **Proyecto Integrador CDS** · Sistema Integral de Gestión de Help Desk  
> **Ruta Técnica:** Node.js / Express (API REST) + PostgreSQL / Supabase Auth + React 19 / Vite 8 (SPA)

---

## 📌 Visión General del Proyecto

**SOLVIX** es una solución integral y moderna de mesa de ayuda (*Help Desk*) diseñada para optimizar la trazabilidad, comunicación y resolución de incidencias tecnológicas entre usuarios solicitantes y especialistas técnicos.

La plataforma ha sido estructurada bajo un estándar de desarrollo B2B SaaS de alto rendimiento, implementando:
- **Seguridad Rigurosa:** Autenticación centralizada mediante Supabase Auth, tokens JWT almacenados en sesión segura, control de acceso basado en roles (**RBAC**), mitigación de fallos de autorización **BOLA/IDOR**, y políticas de cambio obligatorio de contraseña en el primer acceso.
- **Experiencia de Usuario Moderna (UI/UX):** Interfaz fluida y responsive desarrollada en React 19 + Bootstrap 5.3 + Vite 8, con soporte nativo y adaptativo para **Modo Claro (Light Mode) y Modo Oscuro (Dark Mode)**, detección de preferencias del sistema operativo (`prefers-color-scheme`) e iconografía vectorial SVG de alta eficiencia.
- **Operación en Tiempo Real:** Gestión y matriz de transiciones de tickets, asignación dinámica de especialistas, auditoría y trazabilidad cronológica de seguimientos, campana de notificaciones con sondeo reactivo y generación de reportes analíticos ejecutivos en **PDF** y **CSV**.

---

## 🏗️ Arquitectura del Repositorio

El repositorio está organizado en dos componentes principales desacoplados:

```text
11. PROYECTO_INTEGRADOR/
├── nexdesk-backend/                 # API REST y Capa de Datos (Node.js + PostgreSQL)
│   ├── certs/                       # Certificados SSL/TLS para conexión segura a base de datos
│   ├── database/                    # Esquemas SQL, migraciones, semillas y pruebas
│   │   ├── 00_ADVERTENCIA_limpiar_esquema.sql
│   │   ├── 00_VERIFICAR_limpieza_esquema.sql
│   │   ├── 01_schema.sql            # Esquema consolidado integral (DDL, triggers, RLS)
│   │   ├── 02_seed.sql              # Datos de prueba para entorno de laboratorio
│   │   ├── 03_queries.sql           # Consultas analíticas y de auditoría
│   │   ├── 04_tests.sql             # Pruebas funcionales de seguridad y constraints
│   │   ├── 05_verificacion_lab24.sql
│   │   ├── 06_lab25_seguridad.sql
│   │   ├── 07_notificaciones.sql
│   │   ├── 08_funcion_avisos.sql
│   │   ├── 09_avisos_seguimientos.sql
│   │   ├── 10_verificacion_integral.sql
│   │   └── README_ORDEN_SQL.md      # Guía detallada del orden de ejecución SQL
│   ├── postman/                     # Colección de pruebas de integración para Postman
│   ├── src/                         # Código fuente de la API REST Express
│   │   ├── config/                  # Conexión DB (Pool pg), variables de entorno y Supabase
│   │   ├── controllers/             # Controladores de negocio
│   │   ├── middlewares/             # Autenticación JWT, validación de roles y rate limiters
│   │   ├── routes/                  # Definición de endpoints REST
│   │   └── server.js                # Punto de entrada de la aplicación Express
│   ├── .env.example                 # Plantilla de variables de entorno del servidor
│   └── package.json
│
└── nexdesk-frontend/                # Cliente Web SPA (React 19 + Vite 8 + Bootstrap 5.3)
    ├── public/                      # Recursos estáticos públicos (Favicon SOLVIX SVG)
    ├── src/
    │   ├── assets/                  # Recursos gráficos
    │   ├── components/              # Componentes visuales reutilizables e iconografía SVG
    │   │   ├── AnaliticaTickets.jsx # Métricas, gráficos y exportación PDF/CSV
    │   │   ├── CampanaNotificaciones.jsx
    │   │   ├── CredencialTemporal.jsx
    │   │   ├── EstadoBackend.jsx
    │   │   ├── FlujoTickets.jsx     # Diagrama SVG interactivo Dark/Light
    │   │   ├── FormularioUsuario.jsx
    │   │   ├── HistorialSeguimientos.jsx
    │   │   ├── Iconos.jsx           # Set vectorial SVG sin librerías externas
    │   │   ├── ModalAsignarTecnico.jsx
    │   │   ├── ModalCategoria.jsx
    │   │   ├── ModalEditarUsuario.jsx
    │   │   ├── ModalEstadoTicket.jsx
    │   │   ├── ModalEstadoUsuario.jsx
    │   │   ├── ModalNuevoTicket.jsx
    │   │   ├── ModalNuevoUsuario.jsx
    │   │   ├── ModalRestablecerPassword.jsx
    │   │   ├── ModalTecnico.jsx
    │   │   ├── NavbarPrincipal.jsx  # Cabecera con Theme Toggle y menú de usuario
    │   │   ├── Sidebar.jsx          # Barra lateral tecnológica SOLVIX
    │   │   └── ToastBienvenida.jsx
    │   ├── config/                  # Configuración de API y menú por rol
    │   ├── context/                 # Contexto de autenticación (AuthContext)
    │   ├── hooks/                   # Custom hooks (useAuth, useTheme)
    │   ├── layouts/                 # MainLayout (Sidebar + Navbar + Content)
    │   ├── pages/                   # Vistas principales (Login, Dashboard, Tickets, etc.)
    │   ├── routes/                  # AppRouter y RutaProtegida
    │   ├── services/                # Servicios de consumo HTTP (Fetch API)
    │   ├── App.css                  # Utilidades y animaciones
    │   ├── index.css                # Sistema de diseño SOLVIX, variables CSS y temas
    │   └── main.jsx                 # Entrada de la SPA
    ├── .env                         # Configuración pública de conexión a la API
    ├── eslint.config.js             # Reglas de linting (ESLint 10)
    ├── vite.config.js               # Configuración de compilación Vite
    └── package.json
```

---

## 🚀 Requisitos del Sistema

- **Node.js:** Versión 20.19+ o 22 LTS (recomendado Node.js 22.x).
- **Gestor de Paquetes:** npm 10+.
- **Base de Datos:** Instancia de PostgreSQL (v14+) o proyecto configurado en **Supabase**.
- **Herramientas de Desarrollo:** Visual Studio Code, Git, Postman o navegador moderno (Chrome, Edge, Firefox).

---

## ⚙️ Guía de Instalación y Puesta en Marcha

Se recomienda trabajar con **dos terminales independientes** en Visual Studio Code: una para el backend y otra para el frontend.

### Paso 1: Configurar la Base de Datos (PostgreSQL / Supabase)

1. Ingresa al **SQL Editor** de tu proyecto en Supabase (o cliente PostgreSQL).
2. Según el estado de tu base de datos:
   - **Para una base de datos nueva (vacía):** Ejecuta los scripts en el siguiente orden estricto:
     1. `nexdesk-backend/database/01_schema.sql` (crea tablas, índices, roles, triggers y RLS).
     2. `nexdesk-backend/database/02_seed.sql` (datos de prueba para laboratorio).
     3. `nexdesk-backend/database/10_verificacion_integral.sql` (comprueba consistencia).
   - **Para una base de datos existente con datos previos:** Consulta `nexdesk-backend/database/README_ORDEN_SQL.md` para aplicar únicamente las migraciones requeridas (`06` al `09`).

> [!IMPORTANT]
> El esquema de la base de datos implementa seguridad a nivel de filas (**RLS**) y funciones trigger bajo modo `SECURITY INVOKER`. No desactives RLS en el proyecto.

---

### Paso 2: Configurar e Iniciar el Backend

Abre la **Terminal 1** en la raíz del proyecto y dirígete a `nexdesk-backend`:

```powershell
cd nexdesk-backend
npm install
```

1. Crea tu archivo de variables de entorno `.env` copiando la plantilla:
   ```powershell
   cp .env.example .env
   ```
2. Abre `.env` y configura los parámetros de conexión correspondientes a tu entorno:
   - `PORT=3000`
   - `DATABASE_URL=postgresql://usuario:password@host:5432/postgres` (o variables individuales `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
   - `SUPABASE_URL=https://tu-proyecto.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_secreta`
   - `SUPABASE_JWT_SECRET=tu_jwt_secret`
   - `PGSSL_CA_PATH=certs/prod-ca-2021.crt` (si utilizas conexión con verificación TLS).

Inicia el servidor en modo desarrollo:

```powershell
npm run dev
```

Verifica la disponibilidad del servidor en tu navegador o cliente HTTP:
```text
http://localhost:3000/api/estado
```
*Debe retornar `{ "estado": "ok", "timestamp": "..." }`.*

---

### Paso 3: Configurar e Iniciar el Frontend (SOLVIX)

Abre la **Terminal 2** en la raíz del proyecto y dirígete a `nexdesk-frontend`:

```powershell
cd nexdesk-frontend
npm install
```

1. Comprueba o crea el archivo `.env` en `nexdesk-frontend/.env`:
   ```dotenv
   VITE_API_URL=http://localhost:3000
   ```
2. Ejecuta el servidor de desarrollo de Vite:

```powershell
npm run dev
```

Abre en tu navegador la URL que indica la terminal (habitualmente `http://localhost:5173`).

---

## 👥 Matriz de Roles y Niveles de Acceso (RBAC)

La plataforma aplica control de acceso basado en roles tanto en el middleware del backend como en las rutas protegidas del frontend:

| Módulo / Funcionalidad | Superadmin | Administrador | Técnico | Usuario Solicitante |
| :--- | :---: | :---: | :---: | :---: |
| **Panel de Control (Dashboard)** | ✅ Total | ✅ Total | ✅ Métricas de asignación | ✅ Resumen de solicitudes |
| **Gestión de Usuarios** | ✅ Todos los roles | ✅ Técnicos y Usuarios | ❌ Sin acceso | ❌ Sin acceso |
| **Gestión de Técnicos** | ✅ Completa | ✅ Completa | ❌ Solo consulta disp. | ❌ Sin acceso |
| **Categorías de Servicio** | ✅ CRUD completo | ✅ CRUD completo | ❌ Solo lectura | ❌ Solo lectura |
| **Gestión de Tickets** | ✅ Todos | ✅ Todos | ✅ Asignados a su perfil | ✅ Propios creados |
| **Asignar Técnicos** | ✅ Permitido | ✅ Permitido | ❌ Solo lectura | ❌ No permitido |
| **Cambio de Estado Ticket** | ✅ Permitido | ✅ Permitido | ✅ En proceso / Resuelto | ❌ Solo consulta |
| **Seguimientos y Trazabilidad**| ✅ Consulta y nota | ✅ Consulta y nota | ✅ Registro de notas | ✅ Registro de notas |
| **Exportación PDF / CSV** | ✅ Completo | ✅ Completo | ✅ Filtrado a su alcance | ✅ Filtrado a su alcance |
| **Notificaciones** | ✅ Avisos globales | ✅ Asignaciones/Nuevos | ✅ Tickets asignados | ✅ Cambios de estado |

---

## 🎨 Sistema de Diseño "SOLVIX" (UI/UX)

La versión actual incorpora la nueva identidad visual **SOLVIX ("Soluciones rápidas y eficientes")**:

1. **Light & Dark Mode Nativo:**
   - Alternancia fluida con un clic en la barra superior o en la pantalla de login.
   - Sincronización instantánea con el esquema preferido del sistema operativo (`window.matchMedia`).
   - Persistencia de preferencias del usuario mediante `localStorage`.
   - Paleta cromática optimizada para evitar fatiga visual: superficie oscura en tonos pizarra `#0F172A` y `#1E293B` con bordes sutiles `#334155`.
2. **Semántica Visual de Tickets:**
   - **Estados:** Abierto (Azul tecnológico), Asignado (Cian), En proceso (Ámbar), Resuelto (Verde esmeralda), Cerrado (Gris pizarra), Reabierto (Rojo coral).
   - **Criticidad:** Alta / Crítica (Rojo coral con contraste AAA), Media (Ámbar cálido), Baja (Verde menta).
3. **Flujo de Tickets Interactivo:**
   - Diagrama interactivo SVG en el Dashboard que se adapta automáticamente al tema activo, permitiendo inspeccionar cada fase del ciclo de vida del ticket.
4. **Reportes Ejecutivos:**
   - Generación de reportes PDF horizontales estructurados con `jspdf` y `jspdf-autotable`, incluyendo encabezado corporativo SOLVIX, fecha de corte, métricas agregadas y paginación formal.
   - Exportación limpia en CSV con codificación UTF-8 BOM para apertura directa en Microsoft Excel sin problemas de tildes o caracteres especiales.

---

## 🧪 Pruebas y Validación de Calidad

### Frontend (Linting y Verificación)
Para verificar la ausencia de errores de sintaxis, imports no utilizados y cumplimiento de estándares React 19:

```powershell
cd nexdesk-frontend
npm run lint
```
*El proyecto se entrega con 0 errores y 0 advertencias de ESLint.*

Para compilar la versión optimizada de producción:

```powershell
npm run build
npm run preview
```

### Backend (Pruebas de Seguridad y Endpoints)
- **Colección Postman:** Importa los archivos ubicados en `nexdesk-backend/postman/` para ejecutar pruebas automatizadas sobre:
  - Autenticación y renovación de tokens.
  - Validación de campos con `express-validator`.
  - Intentos de acceso no autorizado **BOLA/IDOR** (asegurando respuestas `403 Forbidden`).
  - Pruebas de tasa límite con `express-rate-limit` (prevención de fuerza bruta).

---

## 🔍 Consultas SQL de Comprobación Rápida

Puedes ejecutar estas consultas en el SQL Editor administrativo de Supabase para auditar el funcionamiento:

```sql
-- 1. Verificar últimas notificaciones generadas por triggers
SELECT n.id, n.usuario_id, u.nombre, u.apellido,
       n.ticket_id, n.tipo, n.titulo, n.leida,
       n.fecha_creacion, n.fecha_lectura
FROM public.notificaciones n
JOIN public.usuarios u ON u.id = n.usuario_id
ORDER BY n.fecha_creacion DESC
LIMIT 15;

-- 2. Verificar estado de los triggers activos en el esquema
SELECT trigger_name, event_object_table, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 3. Resumen de tickets agrupados por estado actual
SELECT estado, COUNT(*) AS total
FROM public.tickets
GROUP BY estado
ORDER BY total DESC;
```

---

## 🛠️ Resolución de Problemas Frecuentes

| Síntoma / Error | Causa Probable | Solución Recomendada |
| :--- | :--- | :--- |
| **Error CORS en consola del navegador** | El puerto del frontend no coincide con los orígenes permitidos en Express. | Verifica que el frontend corra en `http://localhost:5173` y que `nexdesk-backend/src/server.js` admita dicho origen en el middleware `cors()`. |
| **Error `401 Unauthorized` persistente** | Token de sesión no enviado o expirado. | Cierra sesión y vuelve a ingresar. Verifica que `sessionStorage` almacene el token correctamente. |
| **Error `403 Forbidden` al cambiar estado** | Violación de la matriz de transiciones o rol sin permisos. | Comprueba que el estado solicitado sea una transición válida para el rol actual (`TRANSICIONES_TICKETS`). |
| **Falla de conexión PostgreSQL (Self-signed cert / TLS)** | Certificado SSL ausente o ruta incorrecta. | Comprueba que `PGSSL_CA_PATH` apunte a `certs/prod-ca-2021.crt` y que el archivo exista en `nexdesk-backend/certs/`. |
| **Campana sin notificaciones** | Sondeo de notificaciones o destinatario. | Las notificaciones se consultan cada 30 segundos. Verifica en SQL que el trigger haya insertado el registro para el `usuario_id` autenticado. |
| **PowerShell bloquea scripts de npm** | Política de ejecución restrictiva en Windows. | Utiliza `npm.cmd` en lugar de `npm`, o ejecuta en la terminal de PowerShell: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`. |

---

## 📄 Licencia y Créditos

Proyecto desarrollado como parte del **Proyecto Integrador CDS**, adaptado a la identidad de marca **SOLVIX — Soluciones rápidas y eficientes**.  
Todos los derechos reservados © 2026.
