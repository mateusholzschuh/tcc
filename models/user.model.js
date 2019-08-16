const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    // attributes...
    name: {
        type: String, 
        required: true, 
        max: 80, 
        trim: true
    },
    cpf: {
        type: String, 
        required: true, 
        max: 11, min: 11, 
        trim: true, 
        // validate: /[\d]{11}/g
    },
    email: {
        type: String, 
        required: false, 
        max: 80, 
        trim: true
    },
    password: {
        type: String, 
        required: false
    },
    avatar: {
        type: String, 
        required: false
    },
    bio: {
        type: String, 
        required: false, 
        max: 255
    },

    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: false
    },
}, 
{
    // auto manage `createdAt` and `updatedAt`
    timestamps: true
});

// export the model
module.exports = mongoose.model('User', UserSchema);