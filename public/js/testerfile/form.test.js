import { JSDOM } from 'jsdom';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'assert';
import { app } from '../../../server'; // Import your server (Node.js app)
import request from 'supertest'; // For making HTTP requests to the server

describe('Connect Form', function () {
  let document;
  let mongoServer;

  // Start the MongoDB in-memory server before the tests
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Load the HTML page with JSDOM
    const dom = await JSDOM.fromFile('./index.html', {
      resources: 'usable',
      runScripts: 'dangerously',
    });
    document = dom.window.document;
  });

  // Close the MongoDB in-memory server after tests
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Test if the form fields are present in the DOM
  it('should have required form fields', () => {
    const form = document.querySelector('#connectForm');
    assert(form !== null, 'Form is missing');

    const inputs = [
      '#personToMeet',
      '#personReferred',
      '#name',
      '#phone',
      '#email',
      '#companyName',
      '#domain-input',
    ];

    inputs.forEach((selector) => {
      const input = document.querySelector(selector);
      assert(input !== null, `${selector} is missing`);
    });
  });

  // Test if an invalid domain input shows error message
  it('should show error for invalid domain input', () => {
    const domainInput = document.querySelector('#domain-input');
    const errorMessage = document.querySelector('#error-message');
    
    domainInput.value = 'InvalidDomain';
    domainInput.dispatchEvent(new Event('input'));

    assert.strictEqual(errorMessage.style.display, 'block', 'Error message is not displayed');
  });

  // Test form submission (simulated) and check backend response
  it('should handle form submission and interact with backend', (done) => {
    const formData = {
      personToMeet: 'Person A',
      personReferred: 'Person B',
      name: 'John Doe',
      phone: '1234567890',
      email: 'johndoe@example.com',
      companyName: 'Company X',
      domain: 'Fintech',
    };

    request(app)
      .post('/api/submitForm') // Replace with your actual API endpoint
      .send(formData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Check if MongoDB interaction was successful
        assert(res.body.success, 'Form submission failed');
        done();
      });
  });

  // Test MongoDB connection and data insertion
  it('should insert form data into MongoDB', async () => {
    const FormData = mongoose.model('FormData', {
      personToMeet: String,
      personReferred: String,
      name: String,
      phone: String,
      email: String,
      companyName: String,
      domain: String,
    });

    const form = new FormData({
      personToMeet: 'Person A',
      personReferred: 'Person B',
      name: 'John Doe',
      phone: '1234567890',
      email: 'johndoe@example.com',
      companyName: 'Company X',
      domain: 'Fintech',
    });

    await form.save();
    const savedForm = await FormData.findOne({ name: 'John Doe' });
    assert(savedForm !== null, 'Form data not saved in MongoDB');
  });
});
