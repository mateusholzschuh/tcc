const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')

let CertificateSchema = new Schema({
    // Atributos...
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
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
    
})

CertificateSchema.pre('save', function(next) {
    let data = ''.concat(this._id, this.event, this.user)

    this.key = crypto.createHash('md5').update(data).digest('hex')
    console.log(this.key)

    // this.save()
    
    next()
})
    
// Exporta o modelo
module.exports = mongoose.model('Certificate', CertificateSchema)