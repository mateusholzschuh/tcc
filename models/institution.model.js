const mongoose = require('mongoose')
const Schema = mongoose.Schema

let InstitutionSchema = new Schema({
    // Atributos...
    name: {type: String, required: true, max: 100},
}, {
    timestamps: true
})

// Exporta o modelo
module.exports = mongoose.model('Institution', InstitutionSchema)