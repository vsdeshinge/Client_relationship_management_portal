const mongoose = require('mongoose');

// Define sub-schemas first
const marketAccessSchema = new mongoose.Schema({
  region: { type: String, required: true },
  business_model: { type: String, required: true },
  industry_domain: { type: String, required: true },
  sub_category: { type: String }
});

const expertTalentSchema = new mongoose.Schema({
  talent_procurement: { type: Boolean, default: false },
  website: { type: Boolean, default: false },
  branding: { type: Boolean, default: false },
  intellectual_property: { type: Boolean, default: false },
  hr_accounts: { type: Boolean, default: false },
  other_services: { type: String }
});

const productCreationSchema = new mongoose.Schema({
  product_design: { type: Boolean, default: false },
  prototype: { type: Boolean, default: false },
  testing_certification: { type: Boolean, default: false },
  cost_estimation: { type: Boolean, default: false },
  indeginization: { type: Boolean, default: false },
  other_services: { type: String }
});

const manufacturingSchema = new mongoose.Schema({
  licensing_inward: { type: Boolean, default: false },
  licensing_outward: { type: Boolean, default: false },
  other_licensing: { type: String },
  office_space: { type: String}
});

const fundingSchema = new mongoose.Schema({
  equity: { type: Boolean, default: false },
  debt: { type: Boolean, default: false },
  project_finance: { type: Boolean, default: false },
  royalty_license_fee: { type: Boolean, default: false },
  subsidy: { type: Boolean, default: false },
  bg_lc: { type: Boolean, default: false },
  not_required: { type: Boolean, default: false },
  other_funding: { type: String }
});

// Main schema that uses the sub-schemas
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  personToMeet: { type: String, required: true },
  personReferred: { type: String, required: true },
  market_access: marketAccessSchema,  // Now marketAccessSchema is defined before use
  expert_talent: expertTalentSchema,
  product_creation: productCreationSchema,
  manufacturing: manufacturingSchema,
  funding: fundingSchema,
  approved: { type: Boolean, default: false },
  adminComment: { type: String }
});

module.exports = mongoose.model('Client', clientSchema);
