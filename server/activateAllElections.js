const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Election = require('./models/Election');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';

async function checkAndForceActive() {
  await mongoose.connect(MONGODB_URI);
  const elections = await Election.find({});
  const now = new Date();
  for (const e of elections) {
    const isActive = now >= e.startDate && now <= e.endDate;
    if (isActive && e.status !== 'active') {
      e.status = 'active';
      await e.save();
      console.log(`Set status to active for: ${e.title}`);
    } else if (!isActive && e.status !== 'upcoming') {
      e.status = 'upcoming';
      await e.save();
      console.log(`Set status to upcoming for: ${e.title}`);
    }
  }
  mongoose.disconnect();
}

checkAndForceActive().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 