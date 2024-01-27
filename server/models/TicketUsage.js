// models/TicketUsage.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketUsageSchema = new Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ticket'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    scanData: String,
    status: {
        type: String,
        required: true,
        default:'ok'
    }
});

module.exports = mongoose.model('TicketUsage', ticketUsageSchema);
