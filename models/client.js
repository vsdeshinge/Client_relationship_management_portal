const mongoose = require('mongoose');

// Sub-schemas
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
    office_space: { type: String }
});

const projectSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
});

const productSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    types: [String], // Changed from productType to match client-side data
    keyFeatures: { type: String },
    targetAudience: { type: String },
    competitiveAnalysis: { type: String },
    usp: { type: String },
    developmentStages: [String], // Changed from developmentStage to match client-side data
    devStageOthers: { type: String }, // Changed from developmentStageOthers to match client-side data
    requiredServices: [String]
});

const serviceSchema = new mongoose.Schema({
    // Changed to a map of service names to boolean values
    type: Map,
    of: Boolean,
    default: {}
});

const solutionSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
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

// Main schema
const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    personToMeet: { type: String, required: true },
    syndicate_name: { type: String, required: true },
    personReferred: { type: String, required: true },
    faceImage: { type: String },
    market_access: marketAccessSchema,
    expert_talent: expertTalentSchema,
    product_creation: productCreationSchema,
    manufacturing: manufacturingSchema,
    funding: fundingSchema,
    projects: projectSchema, // Changed from array to single object to match client-side data
    products: productSchema, // Changed from array to single object to match client-side data
    services: serviceSchema,
    solutions: solutionSchema, // Changed from array to single object to match client-side data
    approved: { type: Boolean, default: false },
    adminComment: { type: String },

    // New fields from business proposal section
    financialCapacity: { type: String },
    annualTurnover: { type: String },
    netWorth: { type: String },
    decisionMakers: [String],
    leadTime: {
        value: { type: String },
        unit: { type: String }
    }
});

module.exports = mongoose.model('Client', clientSchema);
