const express = require('express');
const router = express.Router();

// pega o controller
const User_controller = require('../controllers/user.controller');


// rotas do resource
router.get('/',         User_controller.index);
router.get('/create',   User_controller.create);
router.post('/',        User_controller.store);
router.get('/:id',      User_controller.view);
router.get('/edit/:id', User_controller.edit);
router.post('/update',  User_controller.update);
router.post('/delete',  User_controller.destroy);

// exporta o router
module.exports = router;