const mongoose = require('mongoose');

const syndicateSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  syndicate_name: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true } // New field for department name
});

module.exports = mongoose.model('Syndicate', syndicateSchema);