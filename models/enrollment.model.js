const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EnrollmentSchema = new Schema({
    user : {
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
});

// Exporta o modelo
module.exports = mongoose.model('Enrollment', EnrollmentSchema);