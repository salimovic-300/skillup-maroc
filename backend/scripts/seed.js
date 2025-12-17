const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/Course.model');
const User = require('../models/User.model');

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.create({
        email: 'instructor@skillup.ma',
        password: 'Instructor123!',
        role: 'instructor',
        profile: {
          firstName: 'Ahmed',
          lastName: 'Benali'
        },
        isEmailVerified: true
      });
      console.log('✅ Instructeur créé');
    }

    await Course.deleteMany({});
    console.log('🗑️ Anciens cours supprimés');

    const courses = await Course.insertMany([
      {
        title: 'Formation Complète Développeur Web Full Stack MERN',
        slug: 'formation-mern-stack',
        description: 'Devenez développeur Full Stack en maîtrisant MongoDB, Express.js, React et Node.js. Cette formation complète vous permettra de créer des applications web modernes de A à Z.',
        price: 1500,
        level: 'intermediaire',
        language: 'fr',
        instructor: instructor._id,
        category: 'developpement-web',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        status: 'published',
        duration: 45,
        requirements: ['Connaissances de base en HTML/CSS/JavaScript', 'Un ordinateur avec connexion Internet'],
        whatYouWillLearn: [
          'Créer des applications Full Stack avec MERN',
          'Maîtriser MongoDB et les bases de données NoSQL',
          'Développer des APIs REST avec Node.js et Express',
          'Créer des interfaces modernes avec React',
          'Déployer des applications en production'
        ],
        curriculum: [
          {
            title: 'Introduction au Stack MERN',
            order: 1,
            lessons: [
              { title: 'Présentation du cours', duration: 15, type: 'video', order: 1, isFree: true },
              { title: 'Installation de l\'environnement', duration: 20, type: 'video', order: 2, isFree: true }
            ]
          },
          {
            title: 'MongoDB et Mongoose',
            order: 2,
            lessons: [
              { title: 'Introduction à MongoDB', duration: 30, type: 'video', order: 1 },
              { title: 'Modèles et schémas Mongoose', duration: 40, type: 'video', order: 2 }
            ]
          }
        ]
      }
    ]);

    console.log(`✅ ${courses.length} cours créés !`);
    console.log('Cours:', courses[0].title);
    console.log('ID:', courses[0]._id);
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedCourses();
