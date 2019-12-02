const mongoose = require('mongoose')
const Schema = mongoose.Schema

let WorkshopSchema = new Schema({
    // Atributos...
    name: {
        type: String, 
        required: true, 
        max: 100
    },
    description: {
        type: String,
        max: 250
    },
    location: {
        type: String,
        trim: true,
        max: 100,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    hours: {
        type: Number,
        default: 1
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 1,
    },
    speakers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    enrolleds: [
        {
            user : {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            presence: {
                type: Boolean,
                default: false
            }
        }
    ],
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }
}, {
    timestamps: true
})
    
// Exporta o modelo
module.exports = mongoose.model('Workshop', WorkshopSchema)