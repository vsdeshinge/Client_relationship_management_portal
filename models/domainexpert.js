const mongoose = require('mongoose');

const domainExpertSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  domaintitle: { type: String },
  expertdomain: { type: String },
  academics: { type: String },
  field: { type: String },
  experience: { type: String },
  recognition: { type: String },
  patentsInvention: { type: String },
  network: { type: String },
  expertkeynotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DomainExpert', domainExpertSchema);
