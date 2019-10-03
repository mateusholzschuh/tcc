const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
    }
}, {
    timestamps: true
})
    
// Exporta o modelo
module.exports = mongoose.model('Certificate', CertificateSchema)