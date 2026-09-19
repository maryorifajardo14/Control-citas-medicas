const express = require('express');
const citasRoutes = require('./citas.routes');
const doctoresRoutes = require('./doctores.routes');
const pacientesRoutes = require('./pacientes.routes');

const router = express.Router();

router.use('/citas', citasRoutes);
router.use('/doctores', doctoresRoutes);
router.use('/pacientes', pacientesRoutes);

module.exports = router;
