const bcrypt = require('bcrypt')
const BCRYPT_SALT = 7
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
    birthdate: {
        type: Date,
        required: false,
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
    role: {
        type: Number,
        default: 0  // Basic user level // TODO: middleware baseado no nivel de usuario
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

    instituicao: {
        type: String,
        required: false
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
})

UserSchema.pre('save', function(next) {
    var user = this

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next()

    // hash the password using our new salt
    bcrypt.hash(user.password, BCRYPT_SALT, function(err, hash) {
        if (err) return next(err)

        // override the cleartext password with the hashed one
        user.password = hash
        next()
    })
})

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

// export the model
module.exports = mongoose.model('User', UserSchema)