const db = require('../config/db');

async function findAll() {
    const [rows] = await db.query(
        'SELECT id, nombre, apellido, especialidad, telefono, correo FROM doctores ORDER BY apellido, nombre'
    );
    return rows;
}

async function findById(id) {
    const [rows] = await db.query('SELECT * FROM doctores WHERE id = ?', [id]);
    return rows[0] || null;
}

module.exports = { findAll, findById };
