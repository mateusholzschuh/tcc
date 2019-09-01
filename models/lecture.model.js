const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LectureSchema = new Schema({
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
    confirmed: {
        type: Boolean,
        default: false
    },
    speakers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});
    
// Exporta o modelo
module.exports = mongoose.model('Lecture', LectureSchema);