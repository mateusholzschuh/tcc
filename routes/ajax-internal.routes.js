const express = require('express');
const router = express.Router();

const Enrollment = require('../models/enrollment.model')
const Workshop = require('../models/workshop.model')

router.post('/checkin', async (req, res) => {

    const { enroll, day, checked } = req.body;

    enr = await Enrollment.findById(enroll).exec()

    enr.presences[day] = checked;

    enr = await Enrollment.updateOne({ _id : enroll }, enr).exec()
    .catch(err => {
        return res.json({err, error:true}, 500)
    })

    return res.json(enr, 200)
})

router.post('/workshop/presence', async (req, res) => {

    const { enroll, workshop, checked } = req.body;

    await Workshop.findOneAndUpdate({_id : workshop, 'enrolleds._id' : enroll }, { '$set' : { 'enrolleds.$.presence' : checked }}).exec()
    .then(ok => {        
        return res.json({message:'OK'}, 200)
    }).catch(err => {
        return res.json({errors: ["Ocorreu um erro ao processar, tente novamente"]}, 500)
    })

})

// exporta o router
module.exports = router;