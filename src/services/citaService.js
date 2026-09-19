const citaRepository = require('../repositories/citaRepository');
const pacienteRepository = require('../repositories/pacienteRepository');
const doctorRepository = require('../repositories/doctorRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

const FECHA_HORA_REGEX = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'cancelada', 'atendida'];

// Transiciones de estado permitidas (RQF-05, RQF-10). cancelada y atendida son estados finales.
const TRANSICIONES_ESTADO = {
    pendiente: ['confirmada', 'cancelada'],
    confirmada: ['atendida', 'cancelada'],
    cancelada: [],
    atendida: []
};

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

// RQF-03 / RQNF-07: la disponibilidad se valida siempre en el servidor.
async function verificarDisponibilidad({ doctorId, inicio, fin, excludeId }) {
    const solapadas = await citaRepository.findSolapadas({ doctorId, inicio, fin, excludeId });
    if (solapadas.length > 0) {
        throw new ConflictError('El doctor ya tiene una cita activa que se solapa con ese horario');
    }
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
    await verificarDisponibilidad({
        doctorId: datosValidados.doctorId,
        inicio: datosValidados.inicio,
        fin: datosValidados.fin
    });
    return citaRepository.create(datosValidados);
}

async function reprogramarCita(id, datos) {
    const citaActual = await obtenerCita(id);

    if (['cancelada', 'atendida'].includes(citaActual.estado)) {
        throw new ValidationError(`No se puede reprogramar una cita en estado "${citaActual.estado}"`);
    }

    const { inicio, fin, motivo } = await validarDatosCita({
        pacienteId: citaActual.paciente_id,
        doctorId: citaActual.doctor_id,
        inicio: datos.inicio,
        fin: datos.fin,
        motivo: datos.motivo || citaActual.motivo
    });

    await verificarDisponibilidad({ doctorId: citaActual.doctor_id, inicio, fin, excludeId: id });

    return citaRepository.updateHorario(id, { inicio, fin, motivo });
}

// RQF-05 / RQF-10: cambia el estado preservando el historial (no se elimina la cita).
async function cambiarEstado(id, nuevoEstado) {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
        throw new ValidationError(`Estado "${nuevoEstado}" no es valido`);
    }

    const citaActual = await obtenerCita(id);
    const permitidos = TRANSICIONES_ESTADO[citaActual.estado];

    if (!permitidos.includes(nuevoEstado)) {
        throw new ValidationError(
            `No se puede cambiar la cita de estado "${citaActual.estado}" a "${nuevoEstado}"`
        );
    }

    return citaRepository.updateEstado(id, nuevoEstado);
}

module.exports = { listarCitas, obtenerCita, crearCita, reprogramarCita, cambiarEstado };
