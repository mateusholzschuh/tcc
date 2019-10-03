const mongoose = require('mongoose')
const Schema = mongoose.Schema

let EnrollmentSchema = new Schema({
    code: {
        type: Number,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },

    presences: [Boolean]

}, {
    timestamps: true
})

EnrollmentSchema.pre('save', function (next) {
    // quando a inscrição é criada
    if (this.isNew) {
        mongoose.model('Enrollment', EnrollmentSchema)
            .find({ event: this.event })    // filtra pelo mesmo evento
            .countDocuments()   // conta quantas tem
            .then(res => {
                // não tem inscrições ainda
                if (res === 0) {
                    this.code = 1 // recebe o primeiro codigo
                    next()
                }
                else {
                    mongoose.model('Enrollment', EnrollmentSchema)
                        .find({ event: this.event })    // filtra pelo mesmo evento
                        .select('code') // otimização
                        .sort('-code')  // ordena pelo maior code
                        .limit(1)   // pega o primeiro [maior]
                        .exec()
                        .then(max => {
                            this.code = max[0].code + 1 // incrementa
                            next()
                        })
                        .catch(err => { // caso de erro
                            console.error(err)
                            this.code = -1
                            next()
                        })
                }
            })
    } else {
        next()
    }
})

// Exporta o modelo
module.exports = mongoose.model('Enrollment', EnrollmentSchema)