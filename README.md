Instituto Superior Prisma — Front (Vite) + API (Node) + MySQL (Docker)

Proyecto React + Vite (frontend) con backend Node/Express y MySQL.
La base se levanta con Docker; los datos iniciales se migran desde src/data/*.json hacia MySQL.

Requisitos

Docker Desktop (y Docker Compose)

Node.js v18+ (recomendado v20) en tu host

Puertos libres:

API: 3000

MySQL expuesto: 3307 (mapeado a 3306 dentro del contenedor)

Si ya tenés MySQL local en 3306, no hay problema: el contenedor expone 3307:3306.

Estructura del repo (resumen)
PP4_PFO/
├─ docker-compose.yml
├─ server/                # backend (Node/Express + Prisma)
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ .env.example
│  └─ src/
│     ├─ server.js        # entrypoint de la API
│     ├─ app.js           # cors, rutas, middlewares
│     ├─ routes/          # /api/auth, etc.
│     ├─ controllers/     # auth.controller.js, etc.
│     ├─ db/              # prisma.js
│     └─ scripts/
│        └─ migrate_from_json.js
├─ src/                   # frontend (React + Vite)
│  ├─ pages/              # Login.jsx, etc.
│  ├─ lib/                # api.js
│  └─ data/               # *.json (fuente para la migración)
└─ package.json           # dependencias del front

Variables de entorno
Backend (/server/.env)

Crear desde el template .env.example:

DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASS=root
DB_NAME=prisma_app

# CORS para desarrollo (front en Vite)
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=supersecret


Estas variables las usa el script de migración en tu host y la API dentro del contenedor.

Front (/.env en la raíz del repo)
VITE_API_URL=http://localhost:3000


En dev usamos URL absoluta y CORS en la API (útil si mañana front/back viven en hosts distintos).

Puesta en marcha (desde cero)

Todos los comandos se ejecutan en Windows PowerShell / CMD.

1) Levantar DB y API con Docker (desde la raíz del repo)
docker compose up -d --build
docker compose ps


Deberías ver algo como:

pp4_pfo-db-1  0.0.0.0:3307->3306/tcp
pp4_pfo-api-1 0.0.0.0:3000->3000/tcp


Logs en vivo de la API:

docker compose logs -f api

2) Instalar deps del backend en tu host (solo para la migración)

El script de migración corre en tu host, no en el contenedor. Necesita dotenv.

cd server
npm install

3) Migrar JSON → MySQL

Con el contenedor db arrancado y tu /server/.env configurado:

npm run migrate:json


Deberías ver: Migración OK.

Si algo falla de conexión, confirmá:

docker compose ps muestra pp4_pfo-db-1 Up en 3307

el contenido de /server/.env (host, puerto, user/pass)

4) Instalar deps del front y levantar Vite

Volvé a la raíz y levantá el front:

cd ..
npm install
npm run dev


Abrí http://localhost:5173.
El front llama a la API en http://localhost:3000 vía VITE_API_URL.

Probar rápido
API
curl -i http://localhost:3000/api/health

Login

En el front (pantalla de Login), probá un usuario/clave de src/data/users.json.
Si autenticó, el backend responde con { token, user: { id, username, role } } y el front redirige por rol.

Endpoints clave (extracto)

GET /api/health → { ok: true }

POST /api/auth/login
Body:

{ "username": "docente2", "password": "..." }


Respuesta:

{
  "token": "JWT...",
  "user": { "id": 1, "username": "docente2", "role": "docente", "displayName": "docente2" }
}

Comandos útiles
:: logs API
docker compose logs -f api

:: consola MySQL dentro del contenedor
docker compose exec db mysql -uroot -proot prisma_app

:: reconstruir solo la API
docker compose up -d --build api

:: reset total (baja servicios + borra volúmenes)
docker compose down -v

Solución de problemas frecuentes

“Failed to fetch” en Login y en logs solo aparece OPTIONS /api/auth/login

Revisar CORS en server/src/app.js (app.use(cors(...)) antes de rutas)

Confirmar CORS_ORIGIN=http://localhost:5173 en /server/.env

Reconstruir API: docker compose up -d --build api

ECONNREFUSED 127.0.0.1:3307 al migrar

Asegurate de que el contenedor db esté Up: docker compose ps

Puerto correcto en /server/.env (DB_PORT=3307)

Reintentá: npm run migrate:json

“Cannot find module 'dotenv/config'” al migrar

Ejecutá en /server: npm install dotenv

Asegurate que migrate_from_json.js hace import 'dotenv/config'

Conflicto de puertos

Si 3307 está ocupado, cambiá el mapeo en docker-compose.yml ("3308:3306") y actualizá DB_PORT en /server/.env.

Notas de proyecto

CORS habilitado en la API para http://localhost:5173 (dev).
En producción, agregá tu dominio a CORS_ORIGIN (coma separada).

No se persiste JSON: toda lectura pasó a MySQL; src/data/*.json solo es fuente de migración.

.gitignore en la raíz ignora node_modules del front y del back, y los .env.