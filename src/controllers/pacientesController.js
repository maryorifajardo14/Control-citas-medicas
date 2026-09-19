const pacienteService = require('../services/pacienteService');

async function listar(req, res, next) {
    try {
        const pacientes = await pacienteService.listarPacientes();
        res.json(pacientes);
    } catch (error) {
        next(error);
    }
}

module.exports = { listar };
