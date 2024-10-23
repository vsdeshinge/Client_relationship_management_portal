const mongoose = require('mongoose');

const syndicateSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  syndicate_name: { type: String, required: true },
  password: { type: String, required: true },
  designation: { type: String, required: true } // Use the correct field name: designation
});


module.exports = mongoose.model('Syndicate', syndicateSchema);
