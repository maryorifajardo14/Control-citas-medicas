# Control de Citas Medicas

Modulo funcional de Control de Citas del Sistema Hospitalario Integrado (HIS): calendario interactivo (FullCalendar) para agendar, reprogramar y cancelar citas medicas, respaldado por una API REST propia y una base de datos MySQL en Docker.

## Requisitos

- Docker y Docker Compose
- Node.js 18+ y npm

## 1. Base de datos (MySQL en Docker)

La base de datos se levanta con un solo comando y persiste los datos en un volumen Docker.

```bash
docker compose up -d
```

Esto crea el contenedor `citas_mysql` (MySQL 8.0, puerto 3306) y ejecuta automaticamente, en el primer arranque, los scripts de `db/`:

- `db/schema.sql`: crea la base de datos `citas_medicas` y las tablas `pacientes`, `doctores` y `citas`.
- `db/seed.sql`: inserta datos semilla minimos para pacientes, doctores y citas de ejemplo.

Tambien se levanta `citas_adminer` (Adminer) en `http://localhost:8081` para inspeccionar la base de datos visualmente.

Para detener los contenedores sin perder los datos: `docker compose down`.
Para reiniciar desde cero (borra el volumen y los datos): `docker compose down -v`.

## 2. API REST + interfaz web

```bash
cp .env.example .env
npm install
npm start
```

La aplicacion queda disponible en `http://localhost:3000`:

- `http://localhost:3000/` sirve la interfaz de calendario (FullCalendar).
- `http://localhost:3000/api/...` expone la API REST.

Para desarrollo con recarga automatica: `npm run dev`.

### Arquitectura

El codigo se organiza por capas dentro de `src/`:

```
src/routes/        Definicion de endpoints (capa HTTP)
src/controllers/    Traducen request/response, sin logica de negocio
src/services/        Logica de negocio: validaciones, disponibilidad, estados
src/repositories/    Acceso a datos (consultas SQL con mysql2)
src/middlewares/    Manejo centralizado de errores -> codigos HTTP
public/              Interfaz de calendario (HTML/CSS/JS + FullCalendar)
```

### Endpoints de la API

| Metodo | Ruta                      | Descripcion                                              |
|--------|---------------------------|-----------------------------------------------------------|
| GET    | /api/citas                | Lista citas; filtros `doctor_id`, `paciente_id`, `desde`, `hasta` |
| POST   | /api/citas                | Crea una cita. 409 si hay conflicto de horario con el doctor |
| GET    | /api/citas/:id            | Detalle de una cita                                       |
| PUT    | /api/citas/:id            | Reprograma una cita (usado por el drag & drop)             |
| PATCH  | /api/citas/:id/estado     | Cambia el estado (confirmar, cancelar, atender)            |
| GET    | /api/doctores              | Lista doctores                                            |
| GET    | /api/pacientes              | Lista pacientes                                            |

Codigos de respuesta: `200/201` exito, `400` datos invalidos, `404` no encontrado, `409` conflicto de horario.

### Reglas de negocio implementadas en el servidor

- No se permite doble reserva: un doctor no puede tener dos citas activas (no canceladas) que se solapen en el tiempo.
- Estados de la cita: `pendiente -> confirmada -> atendida`, con `cancelada` alcanzable desde `pendiente` o `confirmada`. Cancelar no borra el registro.
- Solo se pueden reprogramar citas en estado `pendiente` o `confirmada`.

### Interfaz (FullCalendar)

- Vistas de mes y semana.
- Clic en una fecha/hora del calendario para crear una cita.
- Clic en una cita existente para ver el detalle y cambiar su estado.
- Arrastrar y soltar (drag & drop) para reprogramar; redimensionar para ajustar la duracion.
- Color de cada cita segun su estado (pendiente, confirmada, cancelada, atendida).
- Filtro por doctor.
