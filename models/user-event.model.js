const mongoose = require('mongoose')
const Schema = mongoose.Schema

let UserEventSchema = new Schema({
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
    role: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('UserEvent', UserEventSchema)