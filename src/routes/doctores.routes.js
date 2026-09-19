const express = require('express');
const doctoresController = require('../controllers/doctoresController');

const router = express.Router();

router.get('/', doctoresController.listar);

module.exports = router;
