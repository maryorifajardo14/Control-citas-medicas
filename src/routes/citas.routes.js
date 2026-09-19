const express = require('express');
const citasController = require('../controllers/citasController');

const router = express.Router();

router.get('/', citasController.listar);
router.post('/', citasController.crear);
router.get('/:id', citasController.obtener);
router.put('/:id', citasController.reprogramar);

module.exports = router;
