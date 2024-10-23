const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Syndicate = require('./models/syndicate.js');

async function main() {
  try {
    // Connect to MongoDB Atlas
    const uri = 'mongodb+srv://doadmin:0w5Bh26oH43E7cX1@db-mongodb-blr1-64234-171b1e0b.mongo.ondigitalocean.com/admin';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    async function createSyndicateUser(user_id, syndicateName, password, designation) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create a new syndicate user instance with the designation field
        const newSyndicate = new Syndicate({
          user_id: user_id,
          syndicate_name: syndicateName,
          password: hashedPassword,
          designation: designation // Use the correct field name
        });
    
        // Save the new syndicate user to the database
        await newSyndicate.save();
        console.log(`Syndicate user "${syndicateName}" created successfully with user_id: ${user_id} and designation: ${designation}`);
      } catch (error) {
        if (error.code === 11000) {
          console.error(`Error creating syndicate user "${syndicateName}": Duplicate user_id ${user_id}`);
        } else {
          console.error('Error creating syndicate user:', error);
        }
      }
    }
    
    const usersToCreate = [
      { user_id: '101', syndicateName: 'kiranvaithi', password: 'kiran', designation: 'Eco-System Coordinator' },
      // { user_id: '102', syndicateName: 'kiranR', password: 'kiranR', designation: 'Chief-Executive Officer' },
      // { user_id: '103', syndicateName: 'shashidhar', password: 'shashidhar', designation: 'President' },
      // { user_id: '104', syndicateName: 'anandkannan', password: 'anand', designation: 'Strategy Partner' },
      // { user_id: '105', syndicateName: 'sujatha', password: 'sujatha', designation: 'Strategy Partner' }
    ];
    
    for (let user of usersToCreate) {
      await createSyndicateUser(user.user_id, user.syndicateName, user.password, user.designation);
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
