-- Datos semilla minimos para pacientes, doctores y citas de ejemplo

USE citas_medicas;

INSERT INTO pacientes (nombre, apellido, documento, telefono, correo, fecha_nacimiento) VALUES
    ('Ana', 'Martinez', '001-1234567-1', '8091234567', 'ana.martinez@example.com', '1990-05-12'),
    ('Luis', 'Perez', '001-2345678-2', '8092345678', 'luis.perez@example.com', '1985-11-30'),
    ('Carla', 'Gomez', '001-3456789-3', '8093456789', 'carla.gomez@example.com', '1998-02-20');

INSERT INTO doctores (nombre, apellido, especialidad, telefono, correo) VALUES
    ('Rosa', 'Fernandez', 'Medicina General', '8094567890', 'rosa.fernandez@hospital.com'),
    ('Julio', 'Ramirez', 'Pediatria', '8095678901', 'julio.ramirez@hospital.com'),
    ('Elena', 'Torres', 'Cardiologia', '8096789012', 'elena.torres@hospital.com');

INSERT INTO citas (paciente_id, doctor_id, inicio, fin, motivo, estado) VALUES
    (1, 1, '2026-09-22 09:00:00', '2026-09-22 09:30:00', 'Consulta general de rutina', 'pendiente'),
    (2, 2, '2026-09-22 10:00:00', '2026-09-22 10:30:00', 'Control pediatrico', 'confirmada'),
    (3, 3, '2026-09-23 15:00:00', '2026-09-23 15:45:00', 'Evaluacion cardiologica', 'pendiente');
