const express = require('express');
const router = express.Router();

const Enrollment = require('../models/enrollment.model')

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

// exporta o router
module.exports = router;