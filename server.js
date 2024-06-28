const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

const Client = require('./models/client.js');
const Syndicate = require('./models/syndicate.js');
const Admin = require('./models/admin.js');

const JWT_SECRET = 'shakthi';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/posspole', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
  process.exit(1);
});
// WebSocket connection
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
});

const router = express.Router();
// Register route
app.post('/register', async (req, res) => {
  const { name, phone, email, companyName, personToMeet, personReferred } = req.body;

  if (!name || !phone || !email || !companyName || !personToMeet || !personReferred) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newClient = new Client({
      name,
      phone,
      email,
      companyName,
      personToMeet,
      personReferred
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

// Route to get clients for a specific syndicate
app.get('/syndicate-data', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  try {
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const clients = await Client.find({ syndicate_name: decoded.syndicate_name.trim() });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/update-client-data/:clientId', authenticateToken, async (req, res) => {
  const clientId = req.params.clientId;
  const editedData = req.body;

  console.log(`Received update for client ID: ${clientId}`, editedData); // Log client ID and data

  try {
      const existingClient = await Client.findById(clientId);
      if (!existingClient) {
          console.error(`Client not found: ${clientId}`); // Log if client not found
          return res.status(404).json({ error: 'Client not found' });
      }

      // Update the client data with the editedData
      Object.keys(editedData).forEach(key => {
          existingClient[key] = editedData[key];
      });

      // Save the updated client data
      await existingClient.save();
      res.status(200).json(existingClient);
  } catch (error) {
      console.error('Error saving edited data:', error);
      res.status(500).json({ error: 'Failed to save edited data' });
  }
});



app.post('/send-approval-request/:clientId', authenticateToken, async (req, res) => {
  const clientId = req.params.clientId;
  const { adminComments } = req.body;

  console.log('Received approval request for client:', clientId);
  console.log('Admin comments:', adminComments);

  try {
    const updatedClient = await Client.findByIdAndUpdate(clientId, {
      approved: false,
      adminComment: adminComments || ''
    }, { new: true });

    if (!updatedClient) {
      console.error('Client not found');
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client updated successfully:', updatedClient);
    res.status(200).json({ message: 'Approval request sent', client: updatedClient });
  } catch (error) {
    console.error('Error sending approval request:', error);
    res.status(500).json({ error: 'Failed to send approval request' });
  }
});
// Admin routes
router.get('/admin/pending-approvals', authenticateToken, async (req, res) => {
  try {
    const pendingClients = await Client.find({ approved: false });
    res.json(pendingClients);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

router.post('/admin/confirm-approval/:clientId', authenticateToken, async (req, res) => {
  const clientId = req.params.clientId;
  const { adminComment } = req.body;

  console.log('Received approval request for client:', clientId);
  console.log('Admin comments:', adminComment);

  try {
    const updatedClient = await Client.findByIdAndUpdate(clientId, {
      approved: true,
      adminComment: adminComment || ''
    }, { new: true });

    if (!updatedClient) {
      console.error('Client not found');
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client updated successfully:', updatedClient);
    res.status(200).json({ message: 'Approval confirmed', client: updatedClient });
  } catch (error) {
    console.error('Error confirming approval:', error);
    res.status(500).json({ error: 'Failed to confirm approval' });
  }
});

  app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
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
