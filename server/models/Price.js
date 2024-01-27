// models/Price.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const priceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    multiple: {
        type: Number,
        default: 1
    },
    maxUse: {
        type: Number,
        default: 1
    },
    maxTime: {
        type: String,
        required: true
    },
    description: String,
    image: String,
    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Price', priceSchema);
