const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const {compare} = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password:{
        type: String,
        required: [true, 'Please add password'],
        minLength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})
// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// import json web token
UserSchema.methods.getSignJwtToken = function (){
    return jwt.sign({name: this.name}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//if password match
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User',UserSchema)