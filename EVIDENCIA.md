# Evidencia - Serie II: Control de Citas Medicas

> Completar esta plantilla despues de levantar el entorno localmente con `docker compose up -d` y `npm start`.

## 1. Docker

Salida de `docker ps` con los contenedores `citas_mysql` y `citas_adminer` corriendo:

```
(pegar aqui la salida de: docker ps)
```

Captura de pantalla de Adminer (`http://localhost:8081`) mostrando las tablas `pacientes`, `doctores` y `citas` con datos:

```
(insertar captura de pantalla)
```

## 2. API REST (ejemplos con curl)

### Crear una cita (POST /api/citas)

```bash
curl -s -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{"pacienteId":1,"doctorId":1,"inicio":"2026-09-25 09:00","fin":"2026-09-25 09:30","motivo":"Consulta de seguimiento"}'
```

Respuesta:

```
(pegar respuesta JSON, status 201)
```

### Intentar crear una cita en conflicto de horario (debe responder 409)

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{"pacienteId":2,"doctorId":1,"inicio":"2026-09-25 09:15","fin":"2026-09-25 09:45","motivo":"Otra consulta"}'
```

Respuesta esperada: `409`

```
(pegar respuesta)
```

### Listar citas filtradas por doctor (GET /api/citas?doctor_id=1)

```bash
curl -s "http://localhost:3000/api/citas?doctor_id=1"
```

```
(pegar respuesta JSON)
```

### Cambiar estado de una cita (PATCH /api/citas/:id/estado)

```bash
curl -s -X PATCH http://localhost:3000/api/citas/1/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"confirmada"}'
```

```
(pegar respuesta JSON)
```

## 3. Interfaz FullCalendar

Capturas de pantalla mostrando:

- [ ] Vista de mes con citas de colores segun estado
- [ ] Creacion de una cita al hacer clic en el calendario
- [ ] Detalle de una cita al hacer clic sobre el evento
- [ ] Reprogramacion de una cita con drag & drop (antes/despues)
- [ ] Cambio de estado de una cita desde el detalle

```
(insertar capturas de pantalla)
```

## 4. Flujo Git

Salida de `git log --graph --all --oneline`:

```
(pegar aqui la salida del comando)
```

Lista de Pull Requests fusionados a `main`:

| PR | Rama                                     | Descripcion breve                          |
|----|-------------------------------------------|---------------------------------------------|
| #1 | feature/docker-mysql-schema                | Docker Compose + esquema MySQL + semilla    |
| #2 | feature/api-rest-citas                     | API REST de citas, doctores y pacientes     |
| #3 | feature/validacion-conflictos-estados      | Validacion de conflictos y maquina de estados |
| #4 | feature/fullcalendar-ui                    | Interfaz FullCalendar                        |

## 5. Trazabilidad de requisitos (RQF/RQNF)

| ID | Cubierto en |
|----|-------------|
| RQF-01 | feature/api-rest-citas |
| RQF-02 | feature/fullcalendar-ui |
| RQF-03 | feature/validacion-conflictos-estados |
| RQF-04 | feature/fullcalendar-ui |
| RQF-05 | feature/validacion-conflictos-estados |
| RQF-06 | feature/api-rest-citas |
| RQF-07 | feature/api-rest-citas |
| RQF-08 | feature/api-rest-citas |
| RQF-09 | feature/fullcalendar-ui |
| RQF-10 | feature/validacion-conflictos-estados, feature/fullcalendar-ui |
| RQNF-01 | feature/docker-mysql-schema |
| RQNF-02 | feature/docker-mysql-schema |
| RQNF-03 | feature/api-rest-citas |
| RQNF-04 | feature/api-rest-citas |
| RQNF-05 | (todas las ramas + PRs) |
| RQNF-06 | feature/fullcalendar-ui |
| RQNF-07 | feature/validacion-conflictos-estados |
| RQNF-08 | este archivo |
