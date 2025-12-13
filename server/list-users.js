require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

async function listUsers() {
    await connectDB();
    const users = await User.find({});
    console.log('--- Database Users ---');
    if (users.length === 0) {
        console.log('No users found in database.');
    } else {
        users.forEach(user => {
            console.log(`ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Verified: ${user.emailVerified}, Role: ${user.role}`);
        });
    }
    console.log('--- End of List ---');
    mongoose.connection.close();
}

listUsers();
