const express = require('express');
const router = express.Router();

// pega o controller
const controller = require('../controllers/auth.controller');


// rotas
router.get('/login',  controller.login);
router.post('/login', controller.doLogin);

router.get('/logout', controller.doLogout);

router.get('/password/reset', controller.getChangepass)

router.post('/password/reset', controller.postChangepass)

// exporta o router
module.exports = router;