const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Admin = require('./models/admin.js'); 


async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/posspole', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Function to create an admin user
    async function createAdminUser(username, password) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin user instance
        const newAdmin = new Admin({
          username: username,
          password: hashedPassword
        });

        // Save the new admin user to the database
        await newAdmin.save();
        console.log(`Admin user "${username}" created successfully`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(`Error creating admin user "${username}": Duplicate username`);
        } else {
          console.error('Error creating admin user:', error);
        }
      }
    }

    // Manually create admin users
    const adminsToCreate = [
      { username: 'shakthi', password: 'shakthi' },
    
      // Add more admin users as needed
    ];

    for (let admin of adminsToCreate) {
      await createAdminUser(admin.username, admin.password);
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close MongoDB connection after all operations
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Execute main function
main();
