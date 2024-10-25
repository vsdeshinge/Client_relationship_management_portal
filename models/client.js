const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  personToMeet: { type: String },
  personReferred: { type: String },
  domain: { type: String, required: true },
  faceImage: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, default: 'New' },
  // businessProposalStatus: { type: String, default: 'New' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  channelPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelPartner' },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },
  domainExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'DomainExpert' },
  businessProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProposal' },
  // Syndicate-specific fields
  syndicate_name: { type: String }, // This comes from the syndicate clients
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' } // Priority field from syndicate client schema
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
