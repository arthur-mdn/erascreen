// models/Meteo.js
const mongoose = require('mongoose');

const meteoSchema = new mongoose.Schema({
    weatherId: {
        type: Number,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Meteo', meteoSchema);
