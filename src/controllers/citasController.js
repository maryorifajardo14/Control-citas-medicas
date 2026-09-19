const citaService = require('../services/citaService');

async function listar(req, res, next) {
    try {
        const { doctor_id: doctorId, paciente_id: pacienteId, desde, hasta } = req.query;
        const citas = await citaService.listarCitas({ doctorId, pacienteId, desde, hasta });
        res.json(citas);
    } catch (error) {
        next(error);
    }
}

async function obtener(req, res, next) {
    try {
        const cita = await citaService.obtenerCita(req.params.id);
        res.json(cita);
    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {
    try {
        const { pacienteId, doctorId, inicio, fin, motivo } = req.body;
        const cita = await citaService.crearCita({ pacienteId, doctorId, inicio, fin, motivo });
        res.status(201).json(cita);
    } catch (error) {
        next(error);
    }
}

async function reprogramar(req, res, next) {
    try {
        const { inicio, fin, motivo } = req.body;
        const cita = await citaService.reprogramarCita(req.params.id, { inicio, fin, motivo });
        res.json(cita);
    } catch (error) {
        next(error);
    }
}

module.exports = { listar, obtener, crear, reprogramar };
