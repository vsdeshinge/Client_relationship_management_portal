// syndicate.js
const mongoose = require('mongoose');

const syndicateSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true }, // Define user_id with unique constraint
  syndicate_name: { type: String, required: true },
  password: { type: String, required: true }
});

const Syndicate = mongoose.model('Syndicate', syndicateSchema);

module.exports = Syndicate;
