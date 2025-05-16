const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Election = require('./models/Election');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Find or create an admin user
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@1234', // Meets strong password policy
      role: 'admin',
      isVerified: true
    });
    await admin.save();
    console.log('Created admin user: admin@example.com / Admin@1234');
  }

  // Hardcoded active dates
  const startDate = new Date('2024-01-01T00:00:00.000Z');
  const endDate = new Date('2025-12-31T23:59:59.999Z');

  // Example elections
  const elections = [
    {
      title: 'Best Football Player This Year',
      description: 'Vote for the best football player of the year.',
      startDate,
      endDate,
      candidates: [
        { name: 'Mohamed Salah', description: 'Egyptian football superstar.' },
        { name: 'Cristiano Ronaldo', description: 'Legendary striker.' },
        { name: 'Kylian Mbappé', description: 'Rising star.' }
      ],
      createdBy: admin._id
    },
    {
      title: 'Best Egyptian Rapper This Year',
      description: 'Vote for the best Egyptian rapper of the year.',
      startDate,
      endDate,
      candidates: [
        { name: 'Shehab', description: 'Talented Egyptian rapper.' },
        { name: 'Marwan Pablo', description: 'Innovative music producer and rapper.' },
        { name: 'Abyusif', description: 'Influential figure in Egyptian rap.' }
      ],
      createdBy: admin._id
    }
  ];

  await Election.deleteMany({});
  await Election.insertMany(elections);
  console.log('Seeded example elections!');

  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 