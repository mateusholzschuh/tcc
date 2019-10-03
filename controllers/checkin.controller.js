const Enrollment = require('../models/enrollment.model')

/**
 * Mostra a pagina com a listagem dos inscritos
 */
exports.index = async (req, res, next) => {
    let enrolleds = await Enrollment.find({ event: req.params.id }).populate('user', 'name cpf email instituicao').exec()

    return res.render('events/event/checkin/list', {
        title: 'Checkin',
        list: enrolleds,
    })
}

/**
 * Mostra a página de edição das presenças
 */
exports.edit = async (req, res, next) => {
    Enrollment.findById(req.params.enroll)
        .populate('user', 'name cpf')
        .populate('event', 'days')
        .then(doc => {
            return res.render('events/event/checkin/edit', {
                title: 'Check-in',
                turl: '/events/'.concat(req.params.id, '/checkin'),
                obj: doc
            })
        })
        .catch(err => {
            next()
        })
}

exports.ajax = {
    /**
     * Atualiza presença de uma inscrição
     */
    updatePresence: async (req, res) => {
        const { enroll, day, checked } = req.body

        enr = await Enrollment.findById(enroll).exec()

        enr.presences[day] = checked

        enr = await Enrollment.updateOne({ _id : enroll }, enr).exec()
        .catch(err => {
            return res.status(500).json({errors: ["Ocorreu um erro!"], error:true})
        })

        return res.status(200).json({message: 'Presença atualizada com sucesso'})
    }
}