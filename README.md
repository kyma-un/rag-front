# RAG Chatbot (Frontend)

Interfaz web construida con Angular para chatear con un asistente RAG, subir PDFs, consultar documentos y gestionar fuentes multi-source.

## Tecnologias

- Angular 21
- TypeScript
- Tailwind CSS
- Vitest (tests unitarios)

## Caracteristicas

- Chat con el asistente con modo manual o automatico (ruta `/chat`)
- Carga individual de PDFs al backend (ruta `/upload`)
- Estado de documentos, fuentes soportadas e ingesta por fuentes (ruta `/documents`)
- Layout con navbar + sidebar para navegacion rapida

## Requisitos previos

- Node.js 20+ (recomendado LTS)
- npm 10+
- Backend RAG corriendo en `http://localhost:8000`

> Importante: este frontend consume un backend HTTP. Si el backend no esta activo, el chat y la carga/listado de documentos fallaran.

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm start
```

Abre tu navegador en:

`http://localhost:4200`

## Scripts utiles

```bash
# Levantar servidor de desarrollo
npm start

# Build de produccion
npm run build

# Build en modo watch
npm run watch

# Tests unitarios
npm test
```

## Configuracion del backend

La URL base del backend se define en:

- `src/app/services/api.ts`

Actualmente:

```ts
private apiUrl = 'http://localhost:8000';
```

Si tu backend corre en otro host/puerto, cambia ese valor.

### Endpoints esperados por el frontend

- `POST /ask` con body `{ question, mode, sources, k }`
- `GET /sources`
- `GET /documents`
- `POST /documents/upload` (multipart/form-data, campo `file`)
- `POST /documents/ingest-sources` con body `{ sources }`

## Flujo recomendado de uso

1. Inicia el backend RAG.
2. Ejecuta este frontend con `npm start`.
3. Entra a `/upload` y sube documentos.
4. Verifica en `/documents` que se hayan indexado.
5. Consulta en `/chat`.

## Estructura del proyecto

```text
src/
	app/
		components/
			chat/
			documents/
			upload/
		layout/
			navbar/
			sidebar/
		services/
			api.ts
```

## Solucion de problemas

- Error al chatear o subir archivos:
	- Verifica que el backend este activo en `http://localhost:8000`.
- CORS bloqueado en navegador:
	- Habilita CORS en el backend para `http://localhost:4200`.
- Cambios no se reflejan:
	- Reinicia `npm start` y limpia cache del navegador.

## Deploy

Genera build de produccion:

```bash
npm run build
```

Los archivos finales se generan en `dist/` para desplegar en cualquier hosting estatico.
