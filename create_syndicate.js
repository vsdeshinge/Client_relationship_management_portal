const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Syndicate = require('./models/syndicate.js');

async function main() {
  try {
    // Connect to MongoDB Atlas
    const uri = 'mongodb+srv://doadmin:0w5Bh26oH43E7cX1@db-mongodb-blr1-64234-171b1e0b.mongo.ondigitalocean.com/admin';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    async function createSyndicateUser(user_id, syndicateName, password, department) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create a new syndicate user instance with the department field
        const newSyndicate = new Syndicate({
          user_id: user_id,
          syndicate_name: syndicateName,
          password: hashedPassword,
          department: department // Include the department field
        });
    
        // Save the new syndicate user to the database
        await newSyndicate.save();
        console.log(`Syndicate user "${syndicateName}" created successfully with user_id: ${user_id} in department: ${department}`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(`Error creating syndicate user "${syndicateName}": Duplicate user_id ${user_id}`);
        } else {
          console.error('Error creating syndicate user:', error);
        }
      }
    }
    

    const usersToCreate = [
      // { user_id: '100', syndicateName: 'shakthi', password: 'shakthi', department: 'SOFTWARE' },
      { user_id: '101', syndicateName: 'kiran', password: 'kiran', department: 'software' }

    ];
    
    for (let user of usersToCreate) {
      await createSyndicateUser(user.user_id, user.syndicateName, user.password, user.department);
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
