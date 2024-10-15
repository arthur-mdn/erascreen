// models/Image.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const imageSchema = new mongoose.Schema({
    screen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: false,
        default: null
    },
    type: {
        type: String,
        required: true,
        enum: ['photo', 'featured_image', 'icon', 'logo']
    },
    value: {
        type: String,
        required: true
    },
    where: {
        type: String,
        required: true,
        default: "server"
    },
    system: {
        type: String,
        required: false,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', imageSchema);

