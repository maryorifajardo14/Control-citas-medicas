const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'citas_medicas',
    user: process.env.DB_USER || 'citas_user',
    password: process.env.DB_PASSWORD || 'citas_pass',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true
});

module.exports = pool;
