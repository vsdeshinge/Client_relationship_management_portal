const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  personToMeet: { type: String },
  syndicate_name: { type: String },
  personReferred: { type: String },
  faceImage: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, default: 'New' },
  businessProposalStatus: { type: String, default: 'New' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  channelPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelPartner' },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },
  domainExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'DomainExpert' },
  businessProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProposal' }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
