const doctorService = require('../services/doctorService');

async function listar(req, res, next) {
    try {
        const doctores = await doctorService.listarDoctores();
        res.json(doctores);
    } catch (error) {
        next(error);
    }
}

module.exports = { listar };
