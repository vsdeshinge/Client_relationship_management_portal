const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('./models/admin.js'); // Adjust path as necessary





// dev 
async function main() {
  try {
    // Connect to MongoDB
    const uri = 'mongodb+srv://doadmin:0w5Bh26oH43E7cX1@db-mongodb-blr1-64234-171b1e0b.mongo.ondigitalocean.com/admin';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    // Function to create an admin user
    async function createAdminUser(username, password) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminId = generateAdminId(); // Generate adminId here
        const newAdmin = new Admin({
          adminId: adminId,
          username: username,
          password: hashedPassword
        });

        await newAdmin.save();
        console.log(`Admin user "${username}" created successfully with adminId: ${adminId}`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(`Error creating admin user "${username}": Duplicate username`);
        } else {
          console.error('Error creating admin user:', error);
        }
      }
    }

    // Function to generate adminId (example: using UUID)
    function generateAdminId() {
      return 'admin_' + Math.random().toString(36).substr(2, 9); // Example, replace with your preferred method for generating adminId
    }

    // Manually create admin users
    const adminsToCreate = [
      { username: 'kiran', password: 'kiran123' },
      // Add more admin users as needed
    ];

    for (let admin of adminsToCreate) {
      await createAdminUser(admin.username, admin.password);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main();
