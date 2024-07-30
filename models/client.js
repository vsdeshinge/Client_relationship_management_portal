const mongoose = require('mongoose');


const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  personToMeet: { type: String },
  syndicate_name: { type: String },
  personReferred: { type: String },
  faceImage: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, default: 'New' },
  buisnessproposalstatus: { type: String, default: 'New' },
  leadTime: {
      value: { type: String },
      unit: { type: String }
  },
  customer: {
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
  },
  serviceProvider: {
      services: [{ type: String }],
      establishedYear: { type: String },
      teamSize: { type: String },
      turnover: { type: String },
      branches: { type: String },
      expertise: { type: String },
      existingClients: { type: String },
      onHandProjects: { type: String },
      companyType: { type: String },
      experience: { type: String },
      usp: { type: String },
      certifications: { type: String },
      milestones: { type: String },
      others: { type: String }
  },
  manufacturer: {
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
},

  channelPartner: {
      title: { type: String },
      salesCoverage: { type: String },
      channeldomain: { type: String },
      turnover: { type: String },
      reach: [String],
      field: [String],
      itemsList: { type: String },
      channelexperience: { type: String },
      network: { type: String },
      channelmilestones: { type: String },
      keyNotes: { type: String }
  },
  investor: {
      title: { type: String },
      companyName: { type: String },
      investordomain: { type: String },
      networth: { type: String },
      investmentPortfolio: [String],
      previousInvestments: { type: String },
      keyNotes: { type: String }
  },
  // Domain Expert fields
  domainExpert: {
    domaintitle: { type: String },
    position: { type: String },
    expertdomain: { type: String },
    academics: { type: String },
    field: { type: String },
    experience: { type: String },
    recognition: { type: String },
    patentsInvention: { type: String },
    network: { type: String },
    expertkeynotes: { type: String }
  },

   // Business Proposal fields
   businessProposal: {
    typeOfRegistration: { type: String },
    gstNo: { type: String },
    panNo: { type: String },
    annualTurnover: { type: String },
    decisionMakers: { type: String }
   }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);