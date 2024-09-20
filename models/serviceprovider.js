const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  services: [{ type: String }],
  domain: { type: String },
  establishedYear: { type: String },
  teamSize: { type: String },
  turnover: { type: String },
  branches: { type: String },
  expertise: { type: String },
  existingClients: { type: String },
  onHandProjects: { type: String },
  companyType: { type: String },
  experience: { type: String },
  usp: { type: String },
  certifications: { type: String },
  milestones: { type: String },
  others: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
