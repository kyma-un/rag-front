# RAG Chatbot Frontend

Frontend Angular 21 preparado para produccion en Docker, compatible con reverse proxy y backend RAG publicado en `/api`.

## Guia rapida

- Flujo completo Front + Back en Docker: [GUIA_BACK_FRONT_DOCKER.md](GUIA_BACK_FRONT_DOCKER.md)

## Stack

- Angular 21
- TypeScript
- Tailwind CSS
- Nginx (runtime de produccion)

## Objetivo de despliegue

- Frontend servido en `/`
- Backend RAG servido en `/api`
- Mismo origen en produccion (sin cross-domain)

## Configuracion de API base URL

El frontend toma la base URL de API desde `env-config.js` en runtime:

- Archivo fuente: `public/env-config.js`
- Cargado en: `src/index.html`
- Consumo en cliente HTTP: `src/app/services/api.ts`

Regla de fallback:

- Si no hay valor configurado: usa `/api`

En produccion Docker, `env-config.js` se genera al arrancar el contenedor con la variable `API_BASE_URL`.

## Desarrollo local

Instalacion:

```bash
npm install
```

Ejecucion:

```bash
npm start
```

`npm start` usa `proxy.conf.json`, por lo que llamadas a `/api/*` se proxyean a `http://localhost:8000`.

App local:

- `http://localhost:4200`

## Docker de produccion

Build local de imagen:

```bash
docker build -t chatbot-frontend:local .
```

Run local (modo compatible con reverse proxy, API relativa):

```bash
docker run --rm -p 8080:80 --name chatbot-frontend chatbot-frontend:local
```

Run local con API explicita (por ejemplo pruebas fuera de proxy unico):

```bash
docker run --rm -p 8080:80 -e API_BASE_URL=http://host.docker.internal:8000/api --name chatbot-frontend chatbot-frontend:local
```

Healthcheck expuesto en:

- `GET /healthz`

## Integracion con compose del backend

En tu entorno del backend (donde ya existe `FRONTEND_IMAGE`), usa:

```env
FRONTEND_IMAGE=chatbot-frontend:local
```

Luego levanta el compose del backend con su flujo habitual. El servicio frontend consumira esa imagen y seguira llamando al backend via `/api`.

## Endpoints consumidos por el frontend

Con `API_BASE_URL=/api`, el cliente usa:

- `POST /api/ask`
- `GET /api/sources`
- `GET /api/documents`
- `POST /api/documents/upload`
- `POST /api/documents/ingest-sources`

## Scripts utiles

```bash
npm start
npm run build
npm run watch
npm test
```
