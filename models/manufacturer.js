const mongoose = require('mongoose'); // Import mongoose

const manufacturerSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
  manufacturerdomain: { type: String },
  manufacturerestablishedYear: { type: String },
  facility: { type: String },
  area: { type: String },
  talent: { type: String },
  engineers: { type: String },
  productLine: { type: String },
  assemblyLine: { type: String },
  equipments: { type: String },
  certifications: { type: String },
  locations: { type: String },
  machineDetails: { type: String },
  facilityInventory: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' }
}, { timestamps: true });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
