const db = require('../config/db');

async function findAll({ doctorId, pacienteId, desde, hasta } = {}) {
    const conditions = [];
    const params = [];

    if (doctorId) {
        conditions.push('c.doctor_id = ?');
        params.push(doctorId);
    }
    if (pacienteId) {
        conditions.push('c.paciente_id = ?');
        params.push(pacienteId);
    }
    if (desde) {
        conditions.push('c.fin >= ?');
        params.push(desde);
    }
    if (hasta) {
        conditions.push('c.inicio <= ?');
        params.push(hasta);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
        `SELECT c.id, c.paciente_id, c.doctor_id, c.inicio, c.fin, c.motivo, c.estado,
                CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
                CONCAT(d.nombre, ' ', d.apellido) AS doctor_nombre
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         JOIN doctores d ON d.id = c.doctor_id
         ${where}
         ORDER BY c.inicio`,
        params
    );
    return rows;
}

async function findById(id) {
    const [rows] = await db.query(
        `SELECT c.id, c.paciente_id, c.doctor_id, c.inicio, c.fin, c.motivo, c.estado,
                CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
                CONCAT(d.nombre, ' ', d.apellido) AS doctor_nombre
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         JOIN doctores d ON d.id = c.doctor_id
         WHERE c.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create({ pacienteId, doctorId, inicio, fin, motivo }) {
    const [result] = await db.query(
        'INSERT INTO citas (paciente_id, doctor_id, inicio, fin, motivo, estado) VALUES (?, ?, ?, ?, ?, "pendiente")',
        [pacienteId, doctorId, inicio, fin, motivo]
    );
    return findById(result.insertId);
}

async function updateHorario(id, { inicio, fin, motivo }) {
    await db.query('UPDATE citas SET inicio = ?, fin = ?, motivo = ? WHERE id = ?', [inicio, fin, motivo, id]);
    return findById(id);
}

module.exports = { findAll, findById, create, updateHorario };
