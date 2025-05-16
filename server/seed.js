const mongoose = require('mongoose');
const Election = require('./models/Election');

const elections = [
  {
    title: 'Student Council President',
    description: 'Vote for your student council president',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-15'),
    status: 'active',
    candidates: [
      {
        name: 'John Smith',
        description: 'Experienced leader with a vision for student success',
        image: '/images/john-smith.jpg'
      },
      {
        name: 'Sarah Johnson',
        description: 'Passionate about student welfare and community building',
        image: '/images/sarah-johnson.jpg'
      }
    ]
  },
  {
    title: 'Class Representative',
    description: 'Choose your class representative',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-15'),
    status: 'active',
    candidates: [
      {
        name: 'Mike Brown',
        description: 'Dedicated to representing student interests',
        image: '/images/mike-brown.jpg'
      },
      {
        name: 'Emily Davis',
        description: 'Committed to improving class communication',
        image: '/images/emily-davis.jpg'
      }
    ]
  },
  {
    title: 'Sports Captain',
    description: 'Vote for your sports team captain',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-15'),
    status: 'active',
    candidates: [
      {
        name: 'Alex Wilson',
        description: 'Natural leader with excellent team spirit',
        image: '/images/alex-wilson.jpg'
      },
      {
        name: 'Jessica Lee',
        description: 'Experienced athlete with strong leadership skills',
        image: '/images/jessica-lee.jpg'
      }
    ]
  }
];

mongoose.connect('mongodb://localhost:27017/voting-system', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    return Election.insertMany(elections);
  })
  .then(() => {
    console.log('Elections seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding elections:', err);
    process.exit(1);
  }); 