-- Esquema de base de datos para el modulo de Control de Citas Medicas
-- Cubre RQF-01, RQF-03, RQF-05, RQF-07, RQF-10

CREATE DATABASE IF NOT EXISTS citas_medicas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE citas_medicas;

CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(120),
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    especialidad VARCHAR(80) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    doctor_id INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'atendida') NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_citas_doctor FOREIGN KEY (doctor_id) REFERENCES doctores(id),
    CONSTRAINT chk_citas_horario CHECK (fin > inicio)
) ENGINE=InnoDB;

-- Indice de apoyo para la validacion de doble reserva por doctor y rango de horario (RQF-03, RQNF-07)
CREATE INDEX idx_citas_doctor_horario ON citas (doctor_id, inicio, fin);
CREATE INDEX idx_citas_paciente ON citas (paciente_id);
