const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')

let CertificateSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    key: {
        type: String,
    },

    // replicação de dados do usuario
    name: String,
    cpf: String,
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    },
    versionKey: false    
})

CertificateSchema.pre('save', function(next) {
    let data = ''.concat(this._id, this.event, this.user)

    this.key = crypto.createHash('md5').update(data).digest('hex')
    console.log(this.key)

    next()
})
    
module.exports = mongoose.model('Certificate', CertificateSchema)