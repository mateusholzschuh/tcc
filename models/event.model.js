const mongoose = require('mongoose')
const Schema = mongoose.Schema

let EventSchema = new Schema({
    // attributes...
    name: {
        type: String, 
        required: true, 
        max: 80, 
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    finished: {
        type: Boolean,
        default: false
    },
    days: {
        type: Number,
        default: 1
    },
    startDate: {
        type: Date,
        required: false, // ! REVER!!!
        default: Date.now()
    },
    finishDate: {
        type: Date,
        required: false,    // ! REVER!!!
        default: Date.now()
    },
    lectures: [{
        type: Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    workshops: [{
        type: Schema.Types.ObjectId,
        ref: 'Workshop'
    }], // * subevent***
    enrolleds: [{
        type: Schema.Types.ObjectId,
        ref: 'Enrollment'
    }],
    hackathon: {
        type: Schema.Types.ObjectId,
        ref: 'Hackathon'
    }
}, 
{
    // auto manage `createdAt` and `updatedAt`
    timestamps: true
})

// export the model
module.exports = mongoose.model('Event', EventSchema)