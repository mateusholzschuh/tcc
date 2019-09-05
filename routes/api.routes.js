const express = require('express');
const router = express.Router();

const User = require('../models/user.model');
const Institution = require('../models/institution.model');
const Event = require('../models/event.model');
const Workshop = require('../models/workshop.model');

/* rotas de exemplo */
router.get('/users', (req, res) => {
    let page = Number(req.query.page) || 1;
    page = page > 0 ? --page : 0;
    let per_page = Number(req.query.per_page) || 10;

    let fields = req.query.fields || '_id,';
    fields = fields.split(',').join(' ')
    
//'-password -__v'
    User.find().select(fields).limit(per_page).skip(page * per_page).then(doc => {
        res.json(doc);
    }).catch(err => {
        res.status(500).json(err);
    })
});

router.get('/institutions', (req, res) => {
    Institution.find().select('name').then(doc => {
        res.json(doc);
    }).catch(err => {
        res.status(500).json(err);
    })
});


router.get('/events/:id?', (req, res, next) => {
    let q = req.params.id ? { _id: req.params.id } : {};
    Event.find( q ).populate({
        path: 'lectures',
        populate:  {
            path: 'speakers',
            select: 'name',
        }
    }).populate({
        path: 'workshops',
        populate: {
            path: 'speakers',
            select: 'name'
        }
    })
    .exec().then(r => {
        res.json(r)
    }).catch(err => {
        req.message = err.name;
        next()
        res.json(err)
    })

});

router.get('/workshops', async (req, res) => {
    res.json(
        await Workshop.find().populate('event').exec()
    )
})

router.get('/ban', (req, res, next) => {
    req.message = 'Banned';
    next()
})
// Exemplo de rota utilizando função do controller
// router.get('/funcao',   referenciaDoController.funcao);

// exporta o router
module.exports = router;