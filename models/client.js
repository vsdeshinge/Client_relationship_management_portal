const mongoose = require('mongoose');

// Sub-schemas for nested data
const projectSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
});

const serviceDescriptionSchema = new mongoose.Schema({
    types: [{ type: String }],
    manufacturing: [{ type: String }],
    supplyChain: [{ type: String }],
    prototyping: [{ type: String }]
});

const productSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    typesOfProduct: [{ type: String }],
    keyFeaturesAndSpecifications: { type: String },
    targetAudience: { type: String },
    competitiveAnalysis: { type: String },
    uniqueSellingPolicy: { type: String }
});

const solutionSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
});

const serviceProviderSchema = new mongoose.Schema({
    domain: { type: String },
    establishedYear: { type: String },
    teamSize: { type: String },
    turnover: { type: String },
    branches: { type: String },
    expertise: { type: String },
    clients: { type: String },
    projects: { type: String },
    companyType: { type: String },
    experience: { type: String },
    usp: { type: String },
    certifications: { type: String },
    milestones: { type: String },
    others: { type: String }
});

const manufacturerSchema = new mongoose.Schema({
    domain: { type: String },
    establishedYear: { type: String },
    productLine: { type: String },
    assemblyLine: { type: String },
    facility: { type: String },
    equipment: { type: String },
    area: { type: String },
    certifications: { type: String },
    talent: { type: String },
    location: { type: String },
    others: { type: String }
});

const marketAccessSchema = new mongoose.Schema({
    title: { type: String },
    bandwidth: [{ type: String }],
    field: [{ type: String }],
    milestones: { type: String },
    keynotes: { type: String }
});

const otherDetailsSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }
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
    status: { type: String, default: 'New' },
    adminComment: { type: String },
    financialCapacity: { type: String },
    annualTurnover: { type: String },
    netWorth: { type: String },
    decisionMakers: [String],
    leadTime: {
        value: { type: String },
        unit: { type: String }
    },
    customer: {
        project: projectSchema,
        service: serviceDescriptionSchema,
        product: productSchema,
        solution: solutionSchema,
        others: otherDetailsSchema
    },
    serviceProvider: serviceProviderSchema,
    manufacturer: manufacturerSchema,
    marketAccess: marketAccessSchema,
    others: otherDetailsSchema
});

module.exports = mongoose.model('Client', clientSchema);
