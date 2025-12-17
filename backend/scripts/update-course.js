const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course.model');

const updateCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Met à jour tous les cours
    await Course.updateMany(
      {},
      {
        $set: {
          'ratings.average': 4.8,
          'ratings.count': 450,
          studentsEnrolled: 1250
        }
      }
    );

    console.log('✅ Cours mis à jour avec ratings !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

updateCourse();
