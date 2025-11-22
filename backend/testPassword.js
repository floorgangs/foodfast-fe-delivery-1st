import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://fastfood:FastFood31@cluster0.hd9pp.mongodb.net/foodfast')
  .then(async () => {
    console.log('=== Checking all restaurant accounts ===\n');
    
    const users = await mongoose.connection.db.collection('users').find({
      role: 'restaurant'
    }).toArray();
    
    console.log(`Found ${users.length} restaurant accounts:\n`);
    
    for (const user of users) {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      
      const isMatch = await bcrypt.compare('123456', user.password);
      console.log(`Password "123456": ${isMatch ? '✅ WORKS' : '❌ FAILED'}`);
      console.log('---');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
