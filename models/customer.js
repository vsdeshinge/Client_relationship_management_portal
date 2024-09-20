const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Reference to Client
    project: {
      titles: [{ type: String }],
      descriptions: [{ type: String }]
    },
    service: {
      lookingFor: [String],
      design: [String],
      itServices: [String],
      architecture: [String],
      marketAccessReach: [String],
      productLaunch: [String],
      marketing: [String],
      marketIntelligence: [String],
      expertTalent: [String],
      workstationRequired: { type: String },
      productDisplayRequired: { type: String },
      afterSales: [String],
      funding: [String],
      designOthersDescription: { type: String },
      architectureOthersDescription: { type: String },
      productOthersDescription: { type: String },
      marketingOthersDescription: { type: String },
      marketIntelligenceOthersDescription: { type: String },
      expertTalentOthersDescription: { type: String },
      afterSalesOthersDescription: { type: String }
    },
    product: {
      title: { type: String },
      description: { type: String },
      typeOfProduct: [String],
      developmentStage: [String],
      stageOthersDescription: { type: String },
      productDescription: { type: String },
      uspOfProduct: { type: String },
      keyFeatures: { type: String },
      targetAudience: { type: String },
      competitiveAnalysis: { type: String },
      competitors: { type: String },
      uniqueSellingProposition: { type: String },
      manufacturingSupport: [String]
    },
    solution: {
      titles: [{ type: String }],
      descriptions: [{ type: String }]
    },
    others: {
      titles: [{ type: String }],
      descriptions: [{ type: String }]
    }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Customer', customerSchema);
  