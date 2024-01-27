// models/Ticket.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Profile'
    },
    priceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Price'
    },
    buyDate: {
        type: Date,
        default: Date.now
    },
    usages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketUsage'
    }],
    status: {
        type: String,
        required: true,
        default:'ok'
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
