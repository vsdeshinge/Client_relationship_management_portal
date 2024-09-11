const mongoose = require('mongoose');

const momSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  heading: { type: String, required: true },
  summary: { type: String, required: true },
  dateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
  // Additional fields as needed
}, { timestamps: true });

module.exports = mongoose.model('MoM', momSchema);
