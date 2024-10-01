const mongoose = require('mongoose');
const visitSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    collectionType: { type: String, enum: ['Client', 'SyndicateClient'], required: true }, // Track the type of collection
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Visit', visitSchema);
  