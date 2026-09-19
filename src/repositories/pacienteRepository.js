const db = require('../config/db');

async function findAll() {
    const [rows] = await db.query(
        'SELECT id, nombre, apellido, documento, telefono, correo, fecha_nacimiento FROM pacientes ORDER BY apellido, nombre'
    );
    return rows;
}

async function findById(id) {
    const [rows] = await db.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    return rows[0] || null;
}

module.exports = { findAll, findById };
