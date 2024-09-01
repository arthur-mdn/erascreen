// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
        default: 'Unknown'
    },
    firstName: {
        type: String,
        required: true,
        default: 'Unknown'
    },
    lastLogin: {
        type: Date,
        required: true,
        default: Date.now
    },
    creation: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String,
        default: null
    },
    userRole: {
        type: String,
        required: true,
        default: "user"
    }
});

module.exports = mongoose.model('User', userSchema);

