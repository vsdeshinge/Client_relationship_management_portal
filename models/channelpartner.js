const mongoose = require('mongoose');

const channelPartnerSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  title: { type: String },
  salesCoverage: { type: String },
  channeldomain: { type: String },
  turnover: { type: String },
  reach: [String],
  field: [String],
  itemsList: { type: String },
  channelexperience: { type: String },
  network: { type: String },
  channelmilestones: { type: String },
  keyNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ChannelPartner', channelPartnerSchema);
