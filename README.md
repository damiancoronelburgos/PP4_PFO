# PP4_PFO – Instituto Superior Prisma

PP4_PFO es una aplicación web full stack para la gestión académica de un instituto terciario.  
Incluye:

- **Backend**: API REST en **Node.js + Express** con **Prisma** sobre **MySQL**.
- **Frontend**: SPA en **React + Vite** con vistas diferenciadas para **Alumno**, **Docente**, **Preceptor** y **Administrador**.

---

## Objetivo y alcance

El objetivo es centralizar la gestión académica en un único sistema:

- Gestión de alumnos, docentes, preceptores y administrativos (a nivel académico).
- Administración de materias y comisiones.
- Registro y consulta de:
  - Inscripciones  
  - Asistencias  
  - Calificaciones  
  - Justificaciones  
  - Notificaciones y eventos de calendario

### Módulos principales implementados

- **Autenticación y autorización**
  - Login con usuario y contraseña (`/api/auth/login`)
  - JWT + middleware `auth` y `allowRoles` para proteger rutas por rol

- **Alumno**
  - Perfil y datos académicos
  - Comisiones, calificaciones, asistencias
  - Justificaciones propias
  - Notificaciones y calendario

- **Docente**
  - Datos del docente
  - Comisiones a cargo
  - Soporte para carga de asistencias y calificaciones

- **Preceptor**
  - Comisiones a cargo y métricas
  - Registro/consulta de asistencias
  - Gestión de justificaciones (aprobar/rechazar)
  - Comunicaciones a alumnos
  - Notificaciones y calendario

- **Administrativo / Gestión académica**
  - ABM de alumnos (registro académico)
  - Gestión de materias y comisiones
  - Constancias e historial académico
  - Comunicaciones institucionales

---

## Arquitectura

- **Estilo**: cliente–servidor, backend por capas y módulos de dominio.

- **Frontend (React + Vite)**
  - `src/pages`: vistas por rol (`Alumnos`, `Docente`, `Preceptor`, `Administrador`, `Login`)
  - `src/components`: sidebars, rutas protegidas, navegación por rol
  - `src/lib`: wrapper HTTP (`api.js`) y clientes de API por dominio (`alumnos.api.js`, `preceptor.api.js`, etc.)

- **Backend (Node.js + Express)**
  - `server/src/app.js`: configuración de Express y middlewares
  - `server/src/routes/*.routes.js`: rutas agrupadas por dominio (`auth`, `alumnos`, `docentes`, `preceptores`, `ofertaAcademica`, `constancias`, `notificaciones`, etc.)
  - `server/src/controllers/*.controller.js`: lógica de cada caso de uso
  - `server/src/services/*.service.js`: lógica de dominio reutilizable
  - `server/src/db/prisma.js`: instancia de `PrismaClient`

- **Base de datos (MySQL)**  
  - Esquema normalizado con tablas: `usuarios`, `roles`, `alumnos`, `docentes`, `preceptores`, `materias`, `comisiones`, `inscripciones`, `asistencias`, `calificaciones`, `justificaciones`, `notificaciones`, `eventos`, `instituto`, `preceptor_comision`.
  - SQL inicial: `server/db/init/01_full.sql`
  - Modelo Prisma: `server/prisma/schema.prisma`

---

## Estado del proyecto y limitaciones

> ⚠️ El sistema está en **desarrollo / preproducción**.

- No existe un flujo completo de **alta de usuarios** desde la interfaz:
  - No hay pantalla de registro.
  - No hay endpoints públicos para crear usuarios.
- Los usuarios que pueden iniciar sesión deben estar **precargados en la BD**:
  - La tabla `usuarios` (y sus vínculos con `alumnos`, `docentes`, `preceptores`, `administradores`) se llena vía SQL o scripts (`migrate_from_json.js`).
- Conviven partes “viejas” y “nuevas”:
  - Uso residual de `src/data/*.json` en el frontend (en proceso de reemplazo por API real).
  - Middlewares y rutas de notificaciones duplicadas que deben consolidarse.

Líneas de trabajo futuro:

- Completar módulo de gestión de usuarios (alta, baja, cambio de rol) y vistas de administración.
- Unificar middlewares de autenticación y routers de notificaciones.
- Eliminar dependencias de JSON locales en producción.
- Mejorar validaciones, manejo de errores y experiencia de usuario.

---

## Tecnologías principales

**Backend**

- Node.js, Express  
- Prisma ORM (`@prisma/client`)  
- MySQL 
- JWT (`jsonwebtoken`), `bcryptjs`  
- Middlewares: `cors`, `morgan`, `multer`  
- Configuración: `dotenv`, `server/src/config/env.js`  
- Docker/Docker Compose para backend + base de datos  

**Frontend**

- React (hooks), Vite  
- React Router DOM  
- Wrapper `fetch` propio (`src/lib/api.js`)  
- Generación de PDFs (constancias): `jspdf`, `jspdf-autotable`, `html2pdf.js`  
- Estilos CSS modulares por sección  

---

## Puesta en marcha rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/damiancoronelburgos/PP4_PFO PP4_PFO
cd PP4_PFO
```

### 2. Backend – configuración

En `/server`, crear un archivo `.env` (basado en `.env.example`):

```env
PORT=3000
JWT_SECRET=alguna_clave_segura
DATABASE_URL="mysql://usuario:password@host:3306/nombre_base"
```

Crear la base y cargar el esquema:

- Crear BD vacía (por ejemplo `prisma_app`).
- Importar `server/db/init/01_full.sql` en esa base.

### 3. Backend con Docker (recomendado)

```bash
cd server
docker-compose up -d
```

El backend quedará expuesto típicamente en `http://localhost:3000`.

### 4. Frontend

En la raíz del proyecto:

```bash
npm install
npm run dev
```

Configurar la URL de la API en un `.env` en la raíz:

```env
VITE_API_BASE=http://localhost:3000/api
```

El frontend se ejecutará en un puerto tipo `http://localhost:5173`.

---

## Pruebas (frontend)

El frontend cuenta con pruebas automatizadas sobre las vistas principales de **Docente** y **Preceptor**.

### Frameworks utilizados

* [Vitest](https://vitest.dev/) – runner de pruebas
* [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) – pruebas de componentes React

Los scripts de prueba están definidos en `package.json` en la raíz del repo:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

### Ejecutar pruebas

Desde la raíz del proyecto:

```bash
npm install      # si es la primera vez
npm test         # ejecuta todas las pruebas en modo consola
```

### Cobertura actual de pruebas

Las pruebas actuales cubren, entre otras:

* **Docente**

  * `CargarNotas`: render de alumnos iniciales y lógica de búsqueda/filtrado.
  * `Asistencia`: marcado masivo de presentes y desmarcado.
  * `Acta`: guardado de acta y confirmación.
  * `Notificaciones`: marcado de favoritas y filtro de notificaciones.

* **Preceptor**

  * `PreceptorAsistencia`: cambio de estado de asistencia por alumno.
  * `PreceptorNotificaciones`: filtros y favoritos.
  * `PreceptorPerfil`: cambio de contraseña y actualización de datos básicos.

El comando `npm test` muestra en consola el resumen de suites y tests ejecutados, indicando cuáles pasan y si se produce algún fallo.


## Usuarios de prueba

En el estado actual, solo se puede ingresar con usuarios precargados en la tabla `usuarios`.  
Ejemplos típicos (según el SQL inicial):

- `alumno1` / `1111` – rol Alumno  
- `docente2` / `2222` – rol Docente  
- `administrativo3` / `3333` – rol Administrativo  
- `preceptor4` / `4444` – rol Preceptor  

Las contraseñas se guardan como hash `bcrypt` en la base de datos.
