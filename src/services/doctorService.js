const doctorRepository = require('../repositories/doctorRepository');

async function listarDoctores() {
    return doctorRepository.findAll();
}

module.exports = { listarDoctores };
