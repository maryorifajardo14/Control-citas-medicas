const citaRepository = require('../repositories/citaRepository');
const pacienteRepository = require('../repositories/pacienteRepository');
const doctorRepository = require('../repositories/doctorRepository');
const { ValidationError, NotFoundError } = require('../utils/errors');

const FECHA_HORA_REGEX = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

function normalizarFecha(valor, campo) {
    if (!valor || !FECHA_HORA_REGEX.test(valor)) {
        throw new ValidationError(`El campo "${campo}" debe tener formato de fecha/hora valido (YYYY-MM-DD HH:mm)`);
    }
    return valor.replace('T', ' ');
}

async function validarDatosCita({ pacienteId, doctorId, inicio, fin, motivo }) {
    if (!pacienteId || !doctorId) {
        throw new ValidationError('pacienteId y doctorId son obligatorios');
    }
    if (!motivo || !motivo.trim()) {
        throw new ValidationError('El motivo de la cita es obligatorio');
    }

    const inicioNormalizado = normalizarFecha(inicio, 'inicio');
    const finNormalizado = normalizarFecha(fin, 'fin');

    if (new Date(finNormalizado) <= new Date(inicioNormalizado)) {
        throw new ValidationError('La hora de fin debe ser posterior a la hora de inicio');
    }

    const paciente = await pacienteRepository.findById(pacienteId);
    if (!paciente) {
        throw new ValidationError(`No existe un paciente con id ${pacienteId}`);
    }

    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
        throw new ValidationError(`No existe un doctor con id ${doctorId}`);
    }

    return { pacienteId, doctorId, inicio: inicioNormalizado, fin: finNormalizado, motivo: motivo.trim() };
}

async function listarCitas(filtros) {
    return citaRepository.findAll(filtros);
}

async function obtenerCita(id) {
    const cita = await citaRepository.findById(id);
    if (!cita) {
        throw new NotFoundError(`No existe una cita con id ${id}`);
    }
    return cita;
}

async function crearCita(datos) {
    const datosValidados = await validarDatosCita(datos);
    return citaRepository.create(datosValidados);
}

async function reprogramarCita(id, datos) {
    const citaActual = await obtenerCita(id);
    const { inicio, fin, motivo } = await validarDatosCita({
        pacienteId: citaActual.paciente_id,
        doctorId: citaActual.doctor_id,
        inicio: datos.inicio,
        fin: datos.fin,
        motivo: datos.motivo || citaActual.motivo
    });
    return citaRepository.updateHorario(id, { inicio, fin, motivo });
}

module.exports = { listarCitas, obtenerCita, crearCita, reprogramarCita };
