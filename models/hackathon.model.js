const mongoose = require('mongoose')
const Schema = mongoose.Schema

let HackathonSchema = new Schema({
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
        required: false,
        trim: true
    },
    finished: {
        type: Boolean,
        default: false
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
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    teams: [{
        name : {
            type: String,
            required: true
        },
        members : [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    
}, 
{
    // auto manage `createdAt` and `updatedAt`
    timestamps: true
})

// export the model
module.exports = mongoose.model('Hackathon', HackathonSchema)