const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  title: { type: String },
  companyName: { type: String },
  investordomain: { type: String },
  networth: { type: String },
  investmentPortfolio: [String],
  previousInvestments: { type: String },
  keyNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Investor', investorSchema);
