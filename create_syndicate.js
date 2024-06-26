// create_syndicate.js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Syndicate = require('./models/syndicate.js');

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/posspole', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Function to create a syndicate user
    async function createSyndicateUser(user_id, syndicateName, password) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new syndicate user instance
        const newSyndicate = new Syndicate({
          user_id: user_id,
          syndicate_name: syndicateName,
          password: hashedPassword
        });

        // Save the new syndicate user to the database
        await newSyndicate.save();
        console.log(`Syndicate user "${syndicateName}" created successfully with user_id: ${user_id}`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(`Error creating syndicate user "${syndicateName}": Duplicate user_id ${user_id}`);
        } else {
          console.error('Error creating syndicate user:', error);
        }
      }
    }

    // Manually create syndicate users
    const usersToCreate = [
      { user_id: '100', syndicateName: 'shakthi', password: 'shakthi' },
      { user_id: '101', syndicateName: 'kiran', password: 'kiran123' },
      // Add more users as needed
    ];

    for (let user of usersToCreate) {
      await createSyndicateUser(user.user_id, user.syndicateName, user.password);
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
