const pacienteRepository = require('../repositories/pacienteRepository');

async function listarPacientes() {
    return pacienteRepository.findAll();
}

module.exports = { listarPacientes };
