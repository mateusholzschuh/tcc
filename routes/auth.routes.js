const express = require('express');
const router = express.Router();

// pega o controller
const controller = require('../controllers/auth.controller');


// rotas
router.get('/login',  controller.login);
router.post('/login', controller.doLogin);

router.get('/logout', controller.doLogout);

// exporta o router
module.exports = router;