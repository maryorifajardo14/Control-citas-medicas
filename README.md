# Control de Citas Medicas

Modulo funcional de Control de Citas del Sistema Hospitalario Integrado (HIS): calendario interactivo (FullCalendar) para agendar, reprogramar y cancelar citas medicas, respaldado por una API REST propia y una base de datos MySQL en Docker.

## Requisitos

- Docker y Docker Compose
- Node.js 18+ y npm

## Base de datos (MySQL en Docker)

La base de datos se levanta con un solo comando y persiste los datos en un volumen Docker.

```bash
docker compose up -d
```

Esto crea el contenedor `citas_mysql` (MySQL 8.0, puerto 3306) y ejecuta automaticamente, en el primer arranque, los scripts de `db/`:

- `db/schema.sql`: crea la base de datos `citas_medicas` y las tablas `pacientes`, `doctores` y `citas`.
- `db/seed.sql`: inserta datos semilla minimos para pacientes, doctores y citas de ejemplo.

Tambien se levanta `citas_adminer` (Adminer) en `http://localhost:8081` para inspeccionar la base de datos visualmente (util para evidencia).

Para detener los contenedores sin perder los datos:

```bash
docker compose down
```

Para reiniciar desde cero (borra el volumen y los datos):

```bash
docker compose down -v
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar si es necesario:

```bash
cp .env.example .env
```

## Estructura del proyecto

```
db/                 Scripts SQL de esquema y datos semilla
docker-compose.yml  Orquestacion de MySQL + Adminer
```

Las siguientes secciones (API REST, interfaz con FullCalendar) se agregan en las ramas de feature correspondientes.
