# Guia operativa: Frontend + Backend (Docker)

Esta guia resume el flujo completo para levantar el frontend dockerizado junto al backend RAG ya dockerizado, usando un solo origen:

- `/` -> frontend
- `/api` -> backend
- `/api/docs` -> swagger backend

## 1) Prerrequisitos

- Docker Desktop iniciado (Engine running)
- Imagen local del frontend construible desde este repo
- Repo del backend con su `docker compose` y variable `FRONTEND_IMAGE`

## 2) Construir imagen del frontend

Desde este repo (`rag-front`):

```powershell
docker build -t chatbot-frontend:local .
```

Validar que existe:

```powershell
docker images | findstr chatbot-frontend
```

## 3) Prueba rapida del frontend solo

Levantar contenedor de prueba:

```powershell
docker run -d -p 8080:80 --name chatbot-frontend chatbot-frontend:local
```

Verificar healthcheck:

```powershell
curl.exe -i http://localhost:8080/healthz
```

Esperado: `HTTP/1.1 200 OK` y body `ok`.

Verificar home:

```powershell
curl.exe -I http://localhost:8080/
```

Apagar contenedor de prueba:

```powershell
docker stop chatbot-frontend
docker rm chatbot-frontend
```

## 4) Integracion con compose del backend

En el repo del backend, configurar:

```env
FRONTEND_IMAGE=chatbot-frontend:local
```

Levantar stack completo:

```powershell
docker compose up -d
```

Si usas env-file explicito:

```powershell
docker compose --env-file .env up -d
```

## 5) Verificacion funcional end-to-end

Abrir en navegador:

- `http://localhost/` -> frontend
- `http://localhost/api/docs` -> swagger backend

Validar contenedores:

```powershell
docker compose ps
```

Validar logs si hace falta:

```powershell
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
```

## 6) Comportamiento esperado de APIs

El frontend debe llamar a rutas relativas bajo `/api`:

- `/api/ask`
- `/api/sources`
- `/api/documents`
- `/api/documents/upload`
- `/api/documents/ingest-sources`

## 7) Problemas comunes y solucion

### Error: Unable to find image 'chatbot-frontend:local' locally

Causa:
- La imagen no fue construida o fallo el build.

Solucion:

```powershell
docker build -t chatbot-frontend:local .
docker images | findstr chatbot-frontend
```

### Error: pull access denied for chatbot-frontend

Causa:
- Docker intento descargar imagen remota porque no encontro la local.

Solucion:
- Repetir build local y volver a correr.

### Error de daemon / pipe dockerDesktopLinuxEngine

Causa:
- Docker Desktop apagado o engine no iniciado.

Solucion:
- Abrir Docker Desktop y esperar "Engine running".
- Validar con:

```powershell
docker version
```

### Error: puerto en uso (8080 o 80)

Causa:
- Ya hay un contenedor/proceso escuchando ese puerto.

Solucion:

```powershell
docker ps
docker stop chatbot-frontend
docker rm chatbot-frontend
```

O usar otro puerto para prueba local:

```powershell
docker run -d -p 8081:80 --name chatbot-frontend chatbot-frontend:local
```

## 8) Comandos de limpieza

```powershell
docker compose down
docker rm -f chatbot-frontend
```

## 9) Checklist rapido

- [ ] Docker Desktop activo
- [ ] Build OK de `chatbot-frontend:local`
- [ ] `/healthz` responde 200
- [ ] `FRONTEND_IMAGE=chatbot-frontend:local` seteado en backend
- [ ] `docker compose up -d` levantado
- [ ] Front responde en `/`
- [ ] Backend responde en `/api/docs`
- [ ] Requests del navegador van a `/api/...`
