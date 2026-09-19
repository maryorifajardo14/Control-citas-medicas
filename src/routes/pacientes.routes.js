const express = require('express');
const pacientesController = require('../controllers/pacientesController');

const router = express.Router();

router.get('/', pacientesController.listar);

module.exports = router;
