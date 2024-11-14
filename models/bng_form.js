const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formDataSchema = new Schema({
  name: String,
  companyName: String,
  phoneNumber: String,
  email: String,
  domain: String,
  notes: String,
  hasVisitingCard: Boolean,
  visitingCardImages: [{ type: Schema.Types.ObjectId, ref: 'visitingCards.files' }],
  strategyPartner: String
});

module.exports = mongoose.model('FormData', formDataSchema);
