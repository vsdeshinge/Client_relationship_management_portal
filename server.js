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
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const Client = require('./models/client.js');
const Syndicate = require('./models/syndicate.js');
const Admin = require('./models/admin.js');

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

// Init GridFS
let gfs;

mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('GridFS initialized');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/facility', express.static(path.join(__dirname, 'facility')));

// Temporary workaround to ensure MONGODB_URI is defined
process.env.MONGODB_URI = 'mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/?retryWrites=true&w=majority';

// Multer setup for faceImage and xls uploads
const faceImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads', 'blob'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const faceImageUpload = multer({ storage: faceImageStorage }).single('faceImage');

// Create storage engine for GridFS
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

// Debugging helper function
function debugFileObject(file) {
  console.log('File object:', file);
  if (file) {
    console.log('File object keys:', Object.keys(file));
    console.log('File object _id:', file._id);
  }
}



const router = express.Router();

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const tokenHeader = req.headers['authorization'];
  console.log('Authorization header:', tokenHeader);
  if (!tokenHeader) {
    console.error('No token provided');
    return res.sendStatus(401);
  }

  const token = tokenHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  console.log('Extracted token:', token);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Failed to verify token:', err);
      return res.sendStatus(403);
    }
    console.log('Token verified, user:', user);
    req.user = user;
    next();
  });
}

function generateEmailAuthToken(email) {
  const payload = { email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
}

router.post('/generate-email-auth-token', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const token = generateEmailAuthToken(email);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating email auth token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//visitor register
app.post('/register', faceImageUpload, async (req, res) => {
  const { name, phone, email, companyName, personToMeet, personReferred, syndicate_name } = req.body;
  if (!name || !phone || !email || !companyName || !personToMeet || !personReferred || !syndicate_name) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
      const newClient = new Client({
          name,
          phone,
          email,
          companyName,
          personToMeet,
          personReferred,
          syndicate_name: syndicate_name.trim(),
          faceImage: req.file ? req.file.filename : ''
      });

      await newClient.save();
      res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
      console.error('Error saving client:', error);
      res.status(500).json({ error: 'Error during registration. Please try again later.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  console.log('Login Request Body:', req.body);  // Log request body
  const { email, password } = req.body;
  try {
    const client = await Client.findOne({ email });
    if (!client) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordMatch = await bcrypt.compare(password, client.password);
    if (!isPasswordMatch) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ id: client._id, email: client.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ email: client.email, token: token, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/submit-form', authenticateToken, async (req, res) => {
  const formData = req.body;
  console.log('Authenticated user:', req.user);
  console.log('Form data received:', formData);

  try {
      const existingClient = await Client.findOne({ email: req.user.email });
      if (!existingClient) {
          console.error('Client not found for email:', req.user.email);
          return res.status(404).json({ error: 'Client not found' });
      }

      // Create an update object with only the fields that are not empty
      const updateData = {};
      for (const key in formData) {
          if (formData.hasOwnProperty(key) && formData[key] !== '' && formData[key] !== null) {
              updateData[key] = formData[key];
          }
      }

      // Specifically handle nested objects to ensure partial updates
      if (formData.market_access) {
          updateData.market_access = { ...existingClient.market_access?.toObject() || {}, ...formData.market_access };
      }
      if (formData.expert_talent) {
          updateData.expert_talent = { ...existingClient.expert_talent?.toObject() || {}, ...formData.expert_talent };
      }
      if (formData.product_creation) {
          updateData.product_creation = { ...existingClient.product_creation?.toObject() || {}, ...formData.product_creation };
      }
      if (formData.manufacturing) {
          updateData.manufacturing = { ...existingClient.manufacturing?.toObject() || {}, ...formData.manufacturing };
      }
      if (formData.funding) {
          updateData.funding = { ...existingClient.funding?.toObject() || {}, ...formData.funding };
      }

      const updatedClient = await Client.findOneAndUpdate(
          { email: req.user.email },
          { $set: updateData },
          { new: true }
      );

      console.log('Client updated successfully:', updatedClient);
      res.status(201).json(updatedClient);
  } catch (error) {
      console.error('Error submitting client data:', error);
      res.status(500).json({ error: 'Failed to submit client data' });
  }
});
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

    const token = jwt.sign({ id: syndicateUser._id, syndicate_name: syndicateUser.syndicate_name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Syndicate login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









// Admin login route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Attempting login with username: ${username} and password: ${password}`);

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

      const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Login successful, admin ID:', admin._id);
      res.status(200).json({ token, adminId: admin._id }); // Ensure adminId is sent back in the response
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


// Fetch visitor details endpoint
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
      const visitors = await Client.find(dateFilter, 'name companyName phone email status createdAt');
      res.status(200).json(visitors);
  } catch (error) {
      console.error('Error fetching visitor details:', error);
      res.status(500).json({ error: 'Error fetching visitor details. Please try again later.' });
  }
});


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



router.patch('/api/clients/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  let clientData = req.body;

  try {
      const client = await Client.findById(clientId);
      if (!client) {
          return res.status(404).json({ error: 'Client not found' });
      }
      const updatedClient = await Client.findByIdAndUpdate(clientId, { $set: clientData }, { new: true, runValidators: true });
      if (!updatedClient) {
          return res.status(404).json({ error: 'Client not found' });
      }

      console.log('Client data updated successfully:', updatedClient);
      res.status(200).json({ message: 'Client data updated successfully', data: updatedClient });
  } catch (error) {
      console.error('Error updating client data:', error);
      res.status(500).json({ error: 'Error updating client data' });
  }
});


// Route handler for updating investor data
router.patch('/api/investor/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const investorData = req.body;

  try {
      const client = await Client.findById(clientId);
      if (!client) {
          return res.status(404).json({ error: 'Client not found' });
      }

      // Update the investor data in the client document
      client.investor = investorData;

      const updatedClient = await client.save();

      console.log('Investor data updated successfully:', updatedClient);
      res.status(200).json({ message: 'Investor data updated successfully', data: updatedClient });
  } catch (error) {
      console.error('Error updating investor data:', error);
      res.status(500).json({ error: 'Error updating investor data' });
  }
});


app.patch('/api/manufacture/:id', authenticateToken, upload.single('facilityInventory'), async (req, res) => {
  const clientId = req.params.id;
  let manufacturerData = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (req.file) {
      // Log the file object for debugging
      console.log('Received file:', req.file);

      const oldFileId = client.manufacturer.facilityInventory; // Old file ID
      if (oldFileId) {
        gfs.remove({ _id: oldFileId, root: 'uploads' }, (err) => {
          if (err) {
            console.error('Error deleting old file:', err);
          } else {
            console.log('Old file deleted:', oldFileId);
          }
        });
      }

      // Ensure the file has an _id property
      if (!req.file.id) {
        console.error('Uploaded file is missing _id');
        return res.status(500).json({ error: 'Uploaded file is missing _id' });
      }

      manufacturerData['facilityInventory'] = req.file.id; // Store the new file ID
    }

    const parsedManufacturerData = {};
    for (const key in manufacturerData) {
      if (key.startsWith('manufacturer.')) {
        const actualKey = key.split('.')[1];
        parsedManufacturerData[actualKey] = manufacturerData[key];
      }
    }

    client.manufacturer = { ...client.manufacturer.toObject(), ...parsedManufacturerData };

    const updatedClient = await client.save();

    console.log('Manufacturer data updated successfully:', updatedClient);
    res.status(200).json({ message: 'Manufacturer data updated successfully', data: updatedClient });
  } catch (error) {
    console.error('Error updating manufacturer data:', error);
    res.status(500).json({ error: 'Error updating manufacturer data' });
  }
});
// Route handler for updating domain expert data
router.patch('/api/domain/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const domainExpertData = req.body.domainExpert;

  try {
      const client = await Client.findById(clientId);
      if (!client) {
          return res.status(404).json({ error: 'Client not found' });
      }

      // Update the domain expert data in the client document
      client.domainExpert = domainExpertData;

      const updatedClient = await client.save();

      console.log('Domain expert data updated successfully:', updatedClient);
      res.status(200).json({ message: 'Domain expert data updated successfully', data: updatedClient });
  } catch (error) {
      console.error('Error updating domain expert data:', error);
      res.status(500).json({ error: 'Error updating domain expert data' });
  }
});


// Route handler for updating business proposal data
router.patch('/api/proposals/:id', authenticateToken, async (req, res) => {
  const clientId = req.params.id;
  const businessProposalData = req.body.businessProposal;

  try {
      const client = await Client.findById(clientId);
      if (!client) {
          return res.status(404).json({ error: 'Client not found' });
      }

      // Update the business proposal data in the client document
      client.businessProposal = businessProposalData;

      const updatedClient = await client.save();

      console.log('Business proposal data updated successfully:', updatedClient);
      res.status(200).json({ message: 'Business proposal data updated successfully', data: updatedClient });
  } catch (error) {
      console.error('Error updating business proposal data:', error);
      res.status(500).json({ error: 'Error updating business proposal data' });
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

