const mongoose = require('mongoose');

const businessProposalSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  typeOfRegistration: { type: String },
  gstNo: { type: String },
  panNo: { type: String },
  annualTurnover: { type: String },
  decisionMakers: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BusinessProposal', businessProposalSchema);
