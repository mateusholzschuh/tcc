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
    periods: {
        morning: Boolean,
        afternoon: Boolean,
        night: Boolean
    },
    days: {
        type: Number,
        default: 1
    },
    hours: {
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
    },
    api: {
        global: Boolean,
        enroll: Boolean,
        check: Boolean,
        getLectures: Boolean,
        getWorkshops: Boolean,
        getEnrolleds: Boolean,
    },
}, 
{
    // auto manage `createdAt` and `updatedAt`
    timestamps: true
})

// export the model
module.exports = mongoose.model('Event', EventSchema)