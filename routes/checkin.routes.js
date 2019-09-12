const express = require('express');
const router = express.Router({mergeParams: true});

// pega o controller
const controller = require('../controllers/checkin.controller');

// css menu
router.get('/*', (req, res, next) => {
    res.locals.eventMenu = 'checkin'
    next()
})

// rotas do resource

// rota da listagem de inscritos
router.get('/',         controller.index);

// rota para mostrar as presenças de um inscrito
router.get('/:enroll',   controller.edit);

// exporta o router
module.exports = router;