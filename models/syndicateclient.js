const mongoose = require('mongoose');

const syndicateClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    companyName: { type: String },
    personToMeet: { type: String },
    syndicate_name: { type: String, required: true },
    faceImage: { type: mongoose.Schema.Types.ObjectId }, // Optional image field
    // No references to other collections during the initial creation
}, { timestamps: true });

module.exports = mongoose.model('SyndicateClient', syndicateClientSchema);
