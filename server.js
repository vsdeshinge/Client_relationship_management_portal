const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error("Error loading .env file", result.error);
} else {
  console.log("Loaded .env file", result.parsed);
}

console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('JWT_SECRET from .env:', process.env.JWT_SECRET);

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const bcrypt = require('bcryptjs');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const fs = require('fs');
const crypto = require('crypto'); 
const { GridFSBucket } = require('mongodb');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const cron = require('node-cron');



const MoM = require('./models/mom.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
const secondport = process.env.PORT || 5001;

const Client = require('./models/client.js');
const Syndicate = require('./models/syndicate.js');
const Admin = require('./models/admin.js');
const Customer = require('./models/customer.js');
const Investor = require('./models/investor.js');
const ServiceProvider = require('./models/serviceprovider.js');
const Manufacturer = require('./models/manufacturer.js');
const ChannelPartner = require('./models/channelpartner.js');
const DomainExpert = require('./models/domainexpert.js');
const BusinessProposal = require('./models/buisnessproposal.js');
const SyndicateClient = require('./models/syndicateclient.js');
const Visit = require('./models/visitor_logs.js');
const authenticateToken = require('./public/js/authenticateToken.js');
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
  process.exit(1);
});

// Init GridFSBucket
let gridfsBucket;

mongoose.connection.once('open', () => {
  gridfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'faceImages'
  });
  console.log('GridFSBucket initialized');
});


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/faciliwty', express.static(path.join(__dirname, 'facility')));

// Temporary workaround to ensure MONGODB_URI is defined
process.env.MONGODB_URI = 'mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/?retryWrites=true&w=majority';



const faceImageStorage = multer.memoryStorage();
const faceImageUpload = multer({ storage: faceImageStorage }).single('faceImage');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();


// Function to generate JWT token
function generateToken(user, role) {
  const payload = { 
    id: user._id, 
    username: user.username || user.syndicate_name, // Use syndicate_name for syndicate users
    role: role // 'admin' or 'syndicate'
  };

  console.log('Generating token with secret:', process.env.JWT_SECRET); // Log the secret
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
}



app.get('/images/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gridfsBucket.openDownloadStream(fileId);

    // Set the content type to image (assuming the image is a JPEG or PNG)
    res.set('Content-Type', 'image/jpeg'); // Change this based on the type of images you store

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', (err) => {
      console.error('Error during download stream:', err);
      res.sendStatus(404);
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).send('Error retrieving image');
  }
});


// Add your Nodemailer transporter setup here
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services if needed
  auth: {
      user: 'shakthi.amarnath@gmail.com', // Replace with your email
      pass: 'leot sigm nvur fgou' // Replace with your email password
  }
});


// Admin Route - Register Client
app.post('/register', faceImageUpload, async (req, res) => {
  const { name, phone, email, companyName, personToMeet, personReferred, syndicate_name } = req.body;

  if (!name || !phone || !email || !companyName || !personToMeet || !personReferred || !syndicate_name) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
      // Create a new client
      const newClient = new Client({
          name,
          phone,
          email,
          companyName,
          personToMeet,
          personReferred,
          syndicate_name: syndicate_name.trim(),
      });

      if (req.file) {
          const filename = `${crypto.randomBytes(16).toString('hex')}${path.extname(req.file.originalname)}`;
          const uploadStream = gridfsBucket.openUploadStream(filename);

          uploadStream.end(req.file.buffer);

          uploadStream.on('finish', async () => {
              newClient.faceImage = uploadStream.id; // Store the file ID in the database
              
              // Save the new client to the database
              await newClient.save();

              // Generate the QR code and send the email
              await generateAndSendQRCode(newClient); 

              res.status(201).json({ message: 'Registration successful! QR code sent to email.' });
          });

          uploadStream.on('error', (error) => {
              console.error('Error during file upload:', error);
              res.status(500).json({ error: 'Error during file upload' });
          });
      } else {
          // Save the new client to the database
          await newClient.save();

          // Generate the QR code and send the email
          await generateAndSendQRCode(newClient);

          res.status(201).json({ message: 'Registration successful! QR code sent to email.' });
      }
  } catch (error) {
      console.error('Error saving client:', error);
      res.status(500).json({ error: 'Error during registration. Please try again later.' });
  }
});


// Function to generate a QR code, save it, and send it as an inline image in the email
async function generateAndSendQRCode(client, isSyndicateClient = false) {
  try {
      // Determine the URL based on whether the client is a syndicate client
      const pageUrl = isSyndicateClient 
          ? `https://www.posspole.line.pm/syndicate_client_side_visitorform.html`
          : `https://www.posspole.line.pm/visitor.html`;

      // Use the unique client ID to create the QR code URL
      const qrData = `${pageUrl}?client_id=${client._id}`;

      // Define the file path to save the QR code
      const qrCodeFilePath = path.join(__dirname, `${client._id}-qrcode.png`);

      // Generate the QR code and save it to the specified file path
      await QRCode.toFile(qrCodeFilePath, qrData, {
          errorCorrectionLevel: 'M',
          width: 300,
          margin: 2
      });

      // Set up the email with the QR code as an inline image
      const mailOptions = {
          from: 'your-email@gmail.com',
          to: client.email,
          subject: 'Thank You for Registering!',
          html: `
              <!DOCTYPE html>
              <html>
              <head>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          color: #333;
                          line-height: 1.5;
                      }
                  </style>
              </head>
              <body>
                  <h3>Thank you for registering!</h3>
                  <p><strong>Name:</strong> ${client.name}</p>
                  <p><strong>Phone No:</strong> ${client.phone}</p>
                  <p><strong>Email ID:</strong> ${client.email}</p>
                  <p>Scan the QR code below when you visit:</p>
                  <img src="cid:qrcode" alt="QR Code" style="width: 300px; height: 300px;"/>
              </body>
              </html>
          `,
          attachments: [
              {
                  filename: `${client._id}-qrcode.png`,
                  path: qrCodeFilePath,
                  cid: 'qrcode' // Same as the 'cid' in the <img> tag
              }
          ]
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('QR code email sent successfully');

      // Clean up the QR code file from the server after sending the email
      fs.unlinkSync(qrCodeFilePath);
  } catch (error) {
      console.error('Error generating QR code or sending email:', error);
  }
}


// Login route
// app.post('/login', async (req, res) => {
//   console.log('Login Request Body:', req.body);  // Log request body
//   const { email, password } = req.body;
//   try {
//     const client = await Client.findOne({ email });
//     if (!client) {
//       console.log('User not found for email:', email);
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const isPasswordMatch = await bcrypt.compare(password, client.password);
//     if (!isPasswordMatch) {
//       console.log('Invalid password for email:', email);
//       return res.status(401).json({ message: 'Invalid password' });
//     }
//     const token = jwt.sign({ id: client._id, email: client.email }, JWT_SECRET, { expiresIn: '1h' });
//     res.json({ email: client.email, token: token, message: 'Login successful' });
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// syndicate routing 

// Route to fetch syndicate user details
app.get('/api/syndicate-details', authenticateToken, async (req, res) => {
  try {
    const syndicateUser = await Syndicate.findById(req.user.id); // Fetch syndicate user by ID
    if (!syndicateUser) {
      return res.status(404).json({ message: 'Syndicate user not found' });
    }
    res.json(syndicateUser);
  } catch (error) {
    console.error('Error fetching syndicate user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all syndicate names (dropdown)
// app.get('/api/syndicate/names', async (req, res) => {
//   try {
//       const syndicates = await Syndicate.find({}, 'syndicate_name'); // Fetch only syndicate names
//       res.json(syndicates);
//   } catch (error) {
//       console.error('Error fetching syndicate names:', error);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// });


// Syndicate login route
app.post('/syndicate-login', async (req, res) => {
  let { syndicate_name, password } = req.body;

  // Validate inputs
  if (!syndicate_name || !password) {
    return res.status(400).json({ message: 'Syndicate name and password are required' });
  }

  syndicate_name = syndicate_name.trim();

  try {
    const syndicateUser = await Syndicate.findOne({ syndicate_name });
    if (!syndicateUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, syndicateUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token using generateToken function
    const token = generateToken(syndicateUser, 'syndicate');

    res.json({ message: 'Syndicate login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Syndicate Route - Register Syndicate Client
router.post('/api/syndicateclients/register', upload.single('faceImage'), async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1]; // Extract token from Bearer authorization header
    const decodedToken = jwt.verify(token, 'your_secret_key'); // Replace with your secret key
    const syndicate_name = decodedToken.syndicate_name; // Extract syndicate_name from token payload

    const { name, phone, email, companyName, personToMeet } = req.body;

    // Validate required fields: name, phone
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required.' });
    }

    // Check if a client with the same email or phone already exists
    const existingClientByEmail = await SyndicateClient.findOne({ email });
    const existingClientByPhone = await SyndicateClient.findOne({ phone });

    if (existingClientByEmail) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    if (existingClientByPhone) {
      return res.status(400).json({ error: 'Phone number already exists.' });
    }

    // Handle face image upload
    let faceImageId = null;
    if (req.file) {
      const filename = `${crypto.randomBytes(16).toString('hex')}${path.extname(req.file.originalname)}`;
      const uploadStream = gridfsBucket.openUploadStream(filename);
      uploadStream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          faceImageId = uploadStream.id; // Store file ID
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    // Create a new syndicate client
    const syndicateClient = new SyndicateClient({
      name,
      phone,
      email,
      companyName,
      personToMeet,
      syndicate_name, // Auto-assigned from decoded token
      faceImage: faceImageId, // Reference the uploaded image ID
    });

    await syndicateClient.save();

    // Generate the QR code and send the email
    await generateAndSendQRCode(syndicateClient);

    res.status(201).json({ message: 'Syndicate client registered successfully. QR code sent to email.' });

  } catch (error) {
    console.error('Error registering syndicate client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch syndicate clients filtered by syndicate_name
router.get('/api/syndicateclients', authenticateToken, async (req, res) => {
  const syndicateName = req.user.syndicate_name; // Get syndicate name from authenticated user

  try {
    // Fetch clients associated with the syndicate name
    const syndicateClients = await SyndicateClient.find({ syndicate_name: syndicateName });
    res.status(200).json(syndicateClients);
  } catch (error) {
    console.error('Error fetching syndicate clients:', error);
    res.status(500).json({ error: 'Error fetching syndicate clients' });
  }
});

// Route to fetch a specific syndicate client by ID
router.get('/api/syndicateclient/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;

  try {
      const syndicateClient = await SyndicateClient.findById(clientId);
      if (!syndicateClient) {
          return res.status(404).json({ error: 'Client not found' });
      }
      res.status(200).json(syndicateClient);
  } catch (error) {
      console.error('Error fetching syndicate client:', error);
      res.status(500).json({ error: 'Error fetching syndicate client' });
  }
});
router.get('/api/syndicateclients/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;

  try {
      // Populate references to other collections
      const syndicateClient = await SyndicateClient.findById(clientId)
        .populate('project')
        .populate('service')
        .populate('investor')
        .populate('channelPartner')
        .populate('manufacturer')
        .populate('domainExpert');

      if (!syndicateClient) {
          return res.status(404).json({ error: 'Client not found' });
      }

      res.status(200).json(syndicateClient);
  } catch (error) {
      console.error('Error fetching syndicate client:', error);
      res.status(500).json({ error: 'Error fetching syndicate client' });
  }
});




// Admin login route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Attempting login with username: ${username}`);

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('No admin found with that username');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token using generateToken function
    const token = generateToken(admin, 'admin');
    console.log('Login successful, admin ID:', admin._id);
    
    res.status(200).json({ token, adminId: admin._id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// admin dashboard 
router.get('/admin/:id', authenticateToken, async (req, res) => {
  try {
      const admin = await Admin.findById(req.params.id).select('username');
      if (!admin) {
          return res.status(404).json({ error: 'Admin not found' });
      }
      res.status(200).json(admin);
  } catch (error) {
      console.error('Error fetching admin details:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all clients for a specific admin
app.get('/api/admin/:adminId/clients', authenticateToken, async (req, res) => {
  const adminId = req.params.adminId;

  try {
      // Fetch all clients associated with the adminId
      const clients = await Client.find(); // Modify this query to filter based on your logic, e.g., filtering by `adminId`
      
      if (!clients || clients.length === 0) {
          return res.status(404).json({ message: 'No clients found' });
      }

      res.status(200).json(clients);
  } catch (error) {
      console.error('Error fetching client data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Update visitor status route
app.put('/visitors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
      const client = await Client.findByIdAndUpdate(id, { status }, { new: true });
      if (!client) {
          return res.status(404).json({ error: 'Client not found' });
      }
      res.json({ message: 'Status updated successfully', client });
  } catch (error) {
      console.error('Error updating client status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//update status in qualified section
router.put('/clients/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Received ID: ${id}`);
  console.log(`Received Status: ${status}`);

  try {
      const client = await Client.findByIdAndUpdate(
          id,
          { status: status, updatedAt: new Date() },
          { new: true }
      );

      if (!client) {
          return res.status(404).send('Client not found');
      }

      console.log('Updated Client:', client);
      res.status(200).json(client);
  } catch (error) {
      console.error('Error updating client status:', error);
      res.status(500).send('Server error');
  }
});

// Update business proposal section status
router.put('/api/buisness/clients/:id/status', async (req, res) => {
  const { id } = req.params;
  const { buisnessproposalstatus } = req.body;

  try {
      const client = await Client.findByIdAndUpdate(id, { buisnessproposalstatus }, { new: true });
      if (!client) {
          return res.status(404).send('Client not found');
      }
      res.status(200).json(client);
  } catch (error) {
      res.status(500).send('Server error');
  }
});

router.get('/clients-count', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalClientsCount = await Client.countDocuments();
    const todayClientsCount = await Client.countDocuments({ createdAt: { $gte: startOfToday } });
    const weekClientsCount = await Client.countDocuments({ createdAt: { $gte: startOfWeek } });
    const monthClientsCount = await Client.countDocuments({ createdAt: { $gte: startOfMonth } });

    console.log('Total Clients:', totalClientsCount);
    console.log('Today Clients:', todayClientsCount);
    console.log('Week Clients:', weekClientsCount);
    console.log('Month Clients:', monthClientsCount);

    res.status(200).json({
      totalClientsCount,
      todayClientsCount,
      weekClientsCount,
      monthClientsCount
    });
  } catch (error) {
    console.error('Error fetching clients count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get counts of each status
router.get('/api/clients/counts', async (req, res) => {
  try {
      const counts = await Client.aggregate([
          { $match: { status: 'qualified' } },
          { $group: { _id: "$buisnessproposalstatus", count: { $sum: 1 } } }
      ]);
      res.status(200).json(counts);
  } catch (error) {
      res.status(500).send('Server error');
  }
});


// buisness proposal count 
router.get('/api/clients/status-counts', async (req, res) => {
  try {
      const counts = await Client.aggregate([
          { $match: { status: 'qualified' } },
          {
              $group: {
                  _id: "$buisnessproposalstatus",
                  count: { $sum: 1 }
              }
          }
      ]);
      
      const countsMap = counts.reduce((acc, count) => {
          acc[count._id] = count.count;
          return acc;
      }, {});

      res.status(200).json(countsMap);
  } catch (error) {
      res.status(500).send('Server error');
  }
});


// visitor filter (sortby) option
app.get('/visitor-details', authenticateToken, async (req, res) => {
  const { filter } = req.query;
  let dateFilter = {};

  const now = new Date();
  switch (filter) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        }
      };
      break;
    case 'week':
      const startOfWeek = now.getDate() - now.getDay();
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), startOfWeek),
          $lt: new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7)
        }
      };
      break;
    case 'month':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        }
      };
      break;
    default:
      break;
  }

  try {
    // Include 'faceImage' field to fetch image IDs
    const visitors = await Client.find(dateFilter, 'name companyName phone email status faceImage createdAt');
    res.status(200).json(visitors);
  } catch (error) {
    console.error('Error fetching visitor details:', error);
    res.status(500).json({ error: 'Error fetching visitor details. Please try again later.' });
  }
});


// get visitor basic details
router.get('/api/visitors/:id', authenticateToken, async (req, res) => {
  console.log('Received request for visitor ID:', req.params.id);
  try {
      const visitor = await Client.findById(req.params.id);
      if (!visitor) {
          console.log('Visitor not found for ID:', req.params.id);
          return res.status(404).json({ error: 'Visitor not found' });
      }
      res.status(200).json(visitor);
  } catch (error) {
      console.error('Error fetching visitor details:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch clients based on status
router.get('/api/clients', authenticateToken, async (req, res) => {
  const { status } = req.query;
  console.log('Fetching clients with status:', status);  // Log the status received from query
  try {
      let query = {};
      if (status) {
          query.status = status;
      }
      console.log('Query:', query);  // Log the query object
      const clients = await Client.find(query);
      console.log('Clients fetched:', clients);  // Log the clients fetched from the database
      if (clients.length === 0) {
          console.log('No clients found');  // Log if no clients are found
          return res.status(404).json({ message: 'No clients found' });
      }
      res.status(200).json(clients);
  } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get client counts
router.get('/api/client-counts', async (req, res) => {
  try {
      // Count customers with non-empty fields
      const customersCount = await Customer.countDocuments({
          $or: [
              { "project.titles": { $exists: true, $not: { $size: 0 } } },
              { "service.lookingFor": { $exists: true, $not: { $size: 0 } } },
              { "product.title": { $exists: true, $ne: "" } },
              { "solution.titles": { $exists: true, $not: { $size: 0 } } },
              { "others.titles": { $exists: true, $not: { $size: 0 } } }
          ]
      });

      // Count manufacturers with non-empty fields
      const manufacturersCount = await Manufacturer.countDocuments({
          $or: [
              { "manufacturerdomain": { $exists: true, $ne: "" } },
              { "facility": { $exists: true, $ne: "" } },
              { "area": { $exists: true, $ne: "" } },
              // Add other fields as needed
          ]
      });

      // Count service providers with non-empty fields
      const serviceProvidersCount = await ServiceProvider.countDocuments({
          $or: [
              { "services": { $exists: true, $not: { $size: 0 } } },
              { "domain": { $exists: true, $ne: "" } },
              // Add other fields as needed
          ]
      });

      // Count channel partners with non-empty fields
      const channelPartnersCount = await ChannelPartner.countDocuments({
          $or: [
              { "title": { $exists: true, $ne: "" } },
              { "channeldomain": { $exists: true, $ne: "" } },
              // Add other fields as needed
          ]
      });

      // Count investors with non-empty fields
      const investorsCount = await Investor.countDocuments({
          $or: [
              { "title": { $exists: true, $ne: "" } },
              { "companyName": { $exists: true, $ne: "" } },
              // Add other fields as needed
          ]
      });

      // Count domain experts with non-empty fields
      const domainExpertsCount = await DomainExpert.countDocuments({
          $or: [
              { "domaintitle": { $exists: true, $ne: "" } },
              { "expertdomain": { $exists: true, $ne: "" } },
              // Add other fields as needed
          ]
      });

      // Send the counts to the client
      res.json({
          customers: customersCount,
          manufacturers: manufacturersCount,
          serviceProviders: serviceProvidersCount,
          channelPartners: channelPartnersCount,
          investors: investorsCount,
          domainExperts: domainExpertsCount
      });

  } catch (error) {
      console.error('Error fetching client counts:', error);
      res.status(500).json({ error: 'Error fetching client counts' });
  }
});




// Update profile data for a customer
router.patch('/api/customers/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const { customer: customerData } = req.body; // Extract customer object from request body

  try {
    // Find the existing customer data by clientId or create a new one
    let customer = await Customer.findOne({ clientId });

    if (!customer) {
      // Create a new customer entry if it does not exist
      customer = new Customer({ clientId, ...customerData });
    } else {
      // Merge existing data with incoming data
      Object.keys(customerData).forEach((key) => {
        if (customerData[key] !== undefined && customerData[key] !== '') {
          // Merge nested objects correctly
          if (typeof customerData[key] === 'object' && !Array.isArray(customerData[key])) {
            customer[key] = { ...customer[key].toObject(), ...customerData[key] };
          } else {
            customer[key] = customerData[key]; // Only update fields provided in the request
          }
        }
      });
    }

    // Save the updated or new customer document
    const updatedCustomer = await customer.save();

    res.status(200).json({ message: 'Customer data updated successfully', data: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer data:', error);
    res.status(500).json({ error: 'Error updating customer data' });
  }
});






// Update investor data
router.patch('/api/investors/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id; // Get the clientId from the URL params
  const investorData = req.body; // Destructure the investor data from the request body

  try {
    // Find the existing investor data by clientId or create a new one
    let investor = await Investor.findOne({ clientId });

    if (!investor) {
      // Create a new investor entry if it does not exist
      investor = new Investor({ clientId, ...investorData });
    } else {
      // Merge existing data with incoming data
      Object.keys(investorData).forEach((key) => {
        if (investorData[key] !== undefined && investorData[key] !== '') {
          // Only update fields provided in the request and not empty
          investor[key] = investorData[key];
        }
      });
    }

    // Save the updated or new investor document
    const updatedInvestor = await investor.save();

    res.status(200).json({ message: 'Investor data updated successfully', data: updatedInvestor });
  } catch (error) {
    console.error('Error updating investor data:', error);
    res.status(500).json({ error: 'Error updating investor data' });
  }
});







// Update manufacturer data
router.patch('/api/manufacturers/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id; // Get the clientId from the URL params
  const manufacturerData = req.body; // Destructure the manufacturer data from the request body

  try {
    // Find the existing manufacturer data by clientId or create a new one
    let manufacturer = await Manufacturer.findOne({ clientId });

    if (!manufacturer) {
      // Create a new manufacturer entry if it does not exist
      manufacturer = new Manufacturer({ clientId, ...manufacturerData });
    } else {
      // Update only fields that are provided and not empty in the request body
      for (const key in manufacturerData) {
        if (manufacturerData.hasOwnProperty(key) && manufacturerData[key] !== undefined && manufacturerData[key] !== "") {
          manufacturer[key] = manufacturerData[key];
        }
      }
    }

    // Save the updated or new manufacturer document
    const updatedManufacturer = await manufacturer.save();

    res.status(200).json({ message: 'Manufacturer data updated successfully', data: updatedManufacturer });
  } catch (error) {
    console.error('Error updating manufacturer data:', error);
    res.status(500).json({ error: 'Error updating manufacturer data' });
  }
});


// Upload facility inventory file for a manufacturer
router.patch('/api/manufacturers/:id/file', upload.single('facilityInventory'), async (req, res) => {
  const clientId = req.params.id;

  try {
      const manufacturer = await Manufacturer.findOne({ clientId });
      if (!manufacturer) {
          return res.status(404).json({ error: 'Manufacturer not found' });
      }

      if (req.file) {
          const db = mongoose.connection.db;
          const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
          const filename = `${crypto.randomBytes(16).toString('hex')}${path.extname(req.file.originalname)}`;
          const uploadStream = bucket.openUploadStream(filename);

          uploadStream.end(req.file.buffer);

          uploadStream.on('finish', async () => {
              const fileId = uploadStream.id;

              // Delete old file if exists
              if (manufacturer.facilityInventory) {
                  try {
                      await bucket.delete(manufacturer.facilityInventory);
                      console.log('Old file deleted:', manufacturer.facilityInventory);
                  } catch (err) {
                      console.error('Error deleting old file:', err);
                  }
              }

              manufacturer.facilityInventory = fileId;
              const updatedManufacturer = await manufacturer.save();
              res.status(200).json({ message: 'File uploaded and manufacturer data updated successfully', data: updatedManufacturer });
          });

          uploadStream.on('error', (error) => {
              console.error('Error during file upload:', error);
              res.status(500).json({ error: 'Error during file upload' });
          });
      } else {
          res.status(400).json({ error: 'No file uploaded' });
      }
  } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Error uploading file' });
  }
});

// //service provider 
// router.patch('/api/service-providers/:id', authenticateToken, async (req, res) => {
//   const clientId = req.params.id;

//   try {
//     const existingServiceProvider = await ServiceProvider.findOne({ clientId: clientId });
//     console.log('ServiceProvider found:', existingServiceProvider); // Log this to debug

//     if (!existingServiceProvider) {
//       return res.status(404).json({ error: 'Service provider not found' });
//     }

//     const updatedData = {
//       ...existingServiceProvider.toObject(),
//       ...req.body.serviceProvider
//     };

//     const updatedServiceProvider = await ServiceProvider.findOneAndUpdate(
//       { clientId: clientId },
//       { $set: updatedData },
//       { new: true, upsert: false, runValidators: true }
//     );

//     res.status(200).json({ message: 'Service provider data updated successfully', data: updatedServiceProvider });
//   } catch (error) {
//     console.error('Error updating service provider data:', error);
//     res.status(500).json({ error: 'Error updating service provider data' });
//   }
// });



router.patch('/api/service-providers/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const { serviceProvider } = req.body;

  try {
    // Ensure clientId is converted properly into an ObjectId
    const objectIdClientId = new mongoose.Types.ObjectId(clientId);

    let existingServiceProvider = await ServiceProvider.findOne({ clientId: objectIdClientId });

    if (!existingServiceProvider) {
      // Create a new service provider document if none exists
      existingServiceProvider = new ServiceProvider({ clientId: objectIdClientId, ...serviceProvider });
      await existingServiceProvider.save();
      return res.status(201).json({ message: 'Service provider created successfully', data: existingServiceProvider });
    }

    const updatedData = {
      ...existingServiceProvider.toObject(),
      ...serviceProvider
    };

    const updatedServiceProvider = await ServiceProvider.findOneAndUpdate(
      { clientId: objectIdClientId },
      { $set: updatedData },
      { new: true, upsert: false, runValidators: true }
    );

    res.status(200).json({ message: 'Service provider data updated successfully', data: updatedServiceProvider });
  } catch (error) {
    console.error('Error updating service provider data:', error);
    res.status(500).json({ error: 'Error updating service provider data' });
  }
});



// Update channel partner data
router.patch('/api/channel-partners/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id; // Get the clientId from the URL params
  const { channelPartner } = req.body; // Destructure the channel partner data from the request body

  try {
    // Fetch the existing channel partner data
    let existingChannelPartner = await ChannelPartner.findOne({ clientId });

    if (!existingChannelPartner) {
      // Create a new channel partner entry if it does not exist
      existingChannelPartner = new ChannelPartner({ clientId, ...channelPartner });
    } else {
      // Update only fields that are provided and not empty in the request body
      for (const key in channelPartner) {
        if (channelPartner.hasOwnProperty(key) && channelPartner[key] !== undefined && channelPartner[key] !== "") {
          existingChannelPartner[key] = channelPartner[key];
        }
      }
    }

    // Save the updated or new channel partner document
    const updatedChannelPartner = await existingChannelPartner.save();

    res.status(200).json({ message: 'Channel partner data updated successfully', data: updatedChannelPartner });
  } catch (error) {
    console.error('Error updating channel partner data:', error);
    res.status(500).json({ error: 'Error updating channel partner data' });
  }
});

// Update domain expert data
router.patch('/api/domain-experts/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const { domainExpert: domainExpertData } = req.body; // Extract the domainExpert object from req.body

  console.log('Received data:', domainExpertData); // Log incoming data

  try {
    // Find the existing domain expert data by clientId or create a new one
    let domainExpert = await DomainExpert.findOne({ clientId });

    if (!domainExpert) {
      // Create a new domain expert entry if it does not exist
      domainExpert = new DomainExpert({ clientId, ...domainExpertData });
    } else {
      // Merge existing data with incoming data
      Object.keys(domainExpertData).forEach((key) => {
        if (domainExpertData[key] !== undefined && domainExpertData[key] !== '') {
          domainExpert[key] = domainExpertData[key]; // Only update fields provided in the request
        }
      });
    }

    // Save the updated or new domain expert document
    const updatedDomainExpert = await domainExpert.save();

    res.status(200).json({ message: 'Domain expert data updated successfully', data: updatedDomainExpert });
  } catch (error) {
    console.error('Error updating domain expert data:', error);
    res.status(500).json({ error: 'Error updating domain expert data' });
  }
});



// Update business proposal data
// Update business proposal data
router.patch('/api/business-proposals/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const { businessProposal: businessProposalData } = req.body; // Extract businessProposal data from request body

  try {
    // Find the existing business proposal data by clientId or create a new one
    let businessProposal = await BusinessProposal.findOne({ clientId });

    if (!businessProposal) {
      // Create a new business proposal entry if it does not exist
      businessProposal = new BusinessProposal({ clientId, ...businessProposalData });
    } else {
      // Merge existing data with incoming data
      Object.keys(businessProposalData).forEach((key) => {
        if (businessProposalData[key] !== undefined && businessProposalData[key] !== '') {
          businessProposal[key] = businessProposalData[key]; // Only update fields provided in the request
        }
      });
    }

    // Save the updated or new business proposal document
    const updatedBusinessProposal = await businessProposal.save();

    res.status(200).json({ message: 'Business proposal data updated successfully', data: updatedBusinessProposal });
  } catch (error) {
    console.error('Error updating business proposal data:', error);
    res.status(500).json({ error: 'Error updating business proposal data' });
  }
});

// customer view 

// Fetch basic client data based on client ID (admin view)
app.get('/api/adminclient/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;

  try {
    // Fetch the client data from the `Client` collection by its ID
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch client data by ID
router.get('/api/customer/clients/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;

  try {
    // Convert clientId to ObjectId
    const objectId = new mongoose.Types.ObjectId(clientId);

    console.log(`Fetching data for Client ID: ${objectId}`);

    // Use `lean()` to avoid Mongoose overhead and get plain JS objects
    const [customer, serviceProvider, channelPartner, investor, manufacturer, domainExpert] = await Promise.all([
      Customer.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean(),
      ServiceProvider.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean(),
      ChannelPartner.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean(),
      Investor.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean(),
      Manufacturer.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean(),
      DomainExpert.findOne({ clientId: objectId }, '-_id -clientId -createdAt -updatedAt -__v').lean()
    ]);

    // Combine all data into a single object
    let clientData = {
      customer: customer || {},
      serviceProvider: serviceProvider || {},
      channelPartner: channelPartner || {},
      investor: investor || {},
      manufacturer: manufacturer || {},
      domainExpert: domainExpert || {}
    };

    // Remove fields that are null, undefined, or empty
    const filterFields = (obj) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null && value !== '')
      );
    };

    // Apply filtering to remove empty fields from each object
    clientData = Object.fromEntries(
      Object.entries(clientData)
        .map(([key, value]) => [key, filterFields(value)])
        .filter(([_, value]) => Object.keys(value).length > 0)
    );

    // Check if no data is available
    if (Object.keys(clientData).length === 0) {
      return res.status(404).json({ message: 'No client data found for this ID.' });
    }

    console.log('Filtered client data:', clientData);

    res.status(200).json(clientData);
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).json({ error: 'Error fetching client data' });
  }
});



// advanced search filter api 
app.post('/advanced-search', async (req, res) => {
  const { searchFields } = req.body;

  try {
    let clients;

    // Log the incoming searchFields to ensure they're being received correctly
    console.log(`Search fields: ${searchFields}`);

    const searchCriteria = searchFields.map(field => {
      if (field === 'customer') {
        return {
          $or: [
            { 'customer.project.titles': { $exists: true, $not: { $size: 0 } } },
            { 'customer.service.lookingFor': { $exists: true, $not: { $size: 0 } } },
            { 'customer.product.title': { $exists: true, $ne: "" } },
            { 'customer.solution.titles': { $exists: true, $not: { $size: 0 } } },
            { 'customer.others.titles': { $exists: true, $not: { $size: 0 } } }
          ]
        };
      } else if (field === 'serviceProvider') {
        return { 'serviceProvider.domain': { $exists: true, $not: { $size: 0 } } };
      } else if (field === 'manufacturer') {
        return { 'manufacturer.manufacturerdomain': { $exists: true, $ne: "" } };
      } else if (field === 'channelPartner') {
        return { 'channelPartner.channeldomain': { $exists: true, $ne: "" } };
      } else if (field === 'investor') {
        return { 'investor.domain': { $exists: true, $ne: "" } };
      } else if (field === 'domainExpert') {
        return { 'domainExpert.domaintitle': { $exists: true, $ne: "" } };
      }
    });

    // Log the search criteria
    console.log(`Search criteria: ${JSON.stringify(searchCriteria)}`);

    clients = await Client.find({ $or: searchCriteria });

    // Log the clients found
    console.log(`Clients found: ${clients.length}`);

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to create a new MoM
router.post('/api/mom', async (req, res) => {
  const { clientId, heading, summary, dateTime } = req.body;

  if (!clientId || !heading || !summary || !dateTime) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newMoM = new MoM({
      clientId,
      heading,
      summary,
      dateTime
    });

    await newMoM.save();
    res.status(201).json({ message: 'MoM created successfully', mom: newMoM });
  } catch (error) {
    console.error('Error creating MoM:', error);
    res.status(500).json({ error: 'Error creating MoM' });
  }
});

// Endpoint to fetch MoMs for a specific client
router.get('/api/mom/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const moms = await MoM.find({ clientId }).sort({ createdAt: -1 });
    res.status(200).json(moms);
  } catch (error) {
    console.error('Error fetching MoMs:', error);
    res.status(500).json({ error: 'Error fetching MoMs' });
  }
});


// Endpoint to view a specific MoM
router.get('/api/mom/view/:momId', async (req, res) => {
  try {
    const momId = req.params.momId;
    const mom = await MoM.findById(momId);

    if (!mom) {
      return res.status(404).json({ error: 'MoM not found' });
    }

    res.status(200).json(mom);
  } catch (error) {
    console.error('Error fetching MoM:', error);
    res.status(500).json({ error: 'Error fetching MoM' });
  }
});

// set priority in snydicate dashboard 
// Route to update the priority of a client
app.put('/api/syndicateclients/:id/priority', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value. Must be one of "low", "medium", or "high".' });
  }

  try {
      const updatedClient = await SyndicateClient.findByIdAndUpdate(
          id, 
          { priority }, // Update the priority field
          { new: true } // Return the updated document
      );

      if (!updatedClient) {
          return res.status(404).json({ message: 'Client not found' });
      }

      res.status(200).json({ message: 'Priority updated successfully', client: updatedClient });
  } catch (error) {
      console.error('Error updating priority:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// visitor pass apis



// Fetch and display the client data
app.get('/api/client/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find the client in the Client collection
    let client = await Client.findById(id);
    
    if (client) {
      return res.json({ success: true, client, collection: 'Client' });
    }

    // If not found, try to find the client in the SyndicateClient collection
    client = await SyndicateClient.findById(id);
    
    if (client) {
      return res.json({ success: true, client, collection: 'SyndicateClient' });
    }

    // If not found in either collection, return a not found message
    return res.json({ success: false, message: 'Client not found' });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check-in
app.post('/api/client/:id/checkin', async (req, res) => {
  try {
      // Try to find the client in the Client collection
      let client = await Client.findById(req.params.id);
      let collectionType = 'Client';

      // If not found in Client, try to find in SyndicateClient
      if (!client) {
          client = await SyndicateClient.findById(req.params.id);
          collectionType = 'SyndicateClient';
      }

      if (client) {
          // Check if the client has already checked in today
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0); // Set time to the start of the day

          const existingVisit = await Visit.findOne({
              clientId: client._id,
              collectionType: collectionType,
              checkInTime: { $gte: startOfDay }
          });

          if (existingVisit) {
              return res.json({ success: false, message: 'Client has already checked in today.' });
          }

          // Create a new visit entry if not already checked in today
          const newVisit = new Visit({
              clientId: client._id,
              collectionType: collectionType,
              checkInTime: new Date()
          });
          await newVisit.save();

          res.json({ success: true, message: 'Check-in successful', collectionType });
      } else {
          res.json({ success: false, message: 'Client not found' });
      }
  } catch (error) {
      console.error('Error during check-in:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Check-out
app.post('/api/client/:id/checkout', async (req, res) => {
  try {
      // Try to find the client in the Client collection
      let client = await Client.findById(req.params.id);
      let collectionType = 'Client';

      // If not found in Client, try to find in SyndicateClient
      if (!client) {
          client = await SyndicateClient.findById(req.params.id);
          collectionType = 'SyndicateClient';
      }

      if (client) {
          // Find the latest visit for today, regardless of whether checkOutTime is set
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0); // Start of the day
          
          const latestVisit = await Visit.findOne({
              clientId: client._id,
              collectionType: collectionType,
              checkInTime: { $gte: startOfDay }
          }).sort({ checkInTime: -1 });

          if (latestVisit) {
              // Update the checkOutTime even if it was previously set (auto-checkout)
              latestVisit.checkOutTime = new Date();
              await latestVisit.save();

              res.json({ success: true, message: 'Check-out successful', collectionType });
          } else {
              res.json({ success: false, message: 'No active check-in found for today.' });
          }
      } else {
          res.json({ success: false, message: 'Client not found' });
      }
  } catch (error) {
      console.error('Error during check-out:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});


//auto checkout code 


// Auto-checkout cron job
cron.schedule('0 18 * * *', async () => {
  try {
      // Find all visits where checkOutTime is null and it's been more than 6 hours since check-in
      const pendingCheckouts = await Visit.find({
          checkOutTime: null,
          checkInTime: { $lte: new Date(new Date() - 6 * 60 * 60 * 1000) } // 6 hours ago
      });

      // Iterate through each pending checkout
      for (const visit of pendingCheckouts) {
          // Calculate the checkout time as 6 hours after check-in
          const checkOutTime = new Date(visit.checkInTime);
          checkOutTime.setHours(checkOutTime.getHours() + 6);

          // Update the checkout time in the visit document
          await Visit.updateOne({ _id: visit._id }, { $set: { checkOutTime: checkOutTime } });
      }

      console.log('Automatic check-out completed for all pending check-ins.');
  } catch (error) {
      console.error('Error during automatic check-out:', error);
  }
});



router.get('/api/visit-history', async (req, res) => {
  try {
    // Fetch all visits
    const visits = await Visit.find().sort({ checkInTime: -1 });

    // Fetch client data based on collectionType
    const populatedVisits = await Promise.all(
      visits.map(async (visit) => {
        if (visit.collectionType === 'Client') {
          const client = await Client.findById(visit.clientId);
          return { ...visit.toObject(), clientId: client };
        } else if (visit.collectionType === 'SyndicateClient') {
          const client = await SyndicateClient.findById(visit.clientId);
          return { ...visit.toObject(), clientId: client };
        }
      })
    );

    res.status(200).json({ success: true, visits: populatedVisits });
  } catch (error) {
    console.error('Error fetching visit history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch visit history.' });
  }
});



app.use('/', router); // Mount the router



// Serve index.html as default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.listen(secondport, () => {
  console.log(`Server running on port ${secondport}`);
});

