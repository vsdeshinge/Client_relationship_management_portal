const mongoose = require('mongoose');

const ScheduleMeetingSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    summary: { type: String, required: true },
    dateTime: { type: Date, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'SyndicateClient', required: true } // Ensure this references the SyndicateClient model
});

module.exports = mongoose.model('ScheduleMeeting', ScheduleMeetingSchema);
