const mongoose = require('mongoose');
require('dotenv').config();

const courseSchema = new mongoose.Schema({
  title: String, slug: String, description: String, price: Number,
  originalPrice: Number, category: String, instructor: { name: String, title: String },
  duration: String, lessons: Number, students: Number, rating: Number, image: String
});

const Course = mongoose.model('Course', courseSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Course.deleteMany({});
  await Course.insertMany([
    { title: 'Formation Complète Développeur Web Full Stack MERN', slug: 'formation-mern-stack', description: 'Devenez développeur Full Stack', price: 1500, originalPrice: 2500, category: 'developpement-web', instructor: { name: 'Ahmed Benali', title: 'Senior Developer' }, duration: '45h', lessons: 180, students: 0, rating: 4.8, image: '/images/mern.jpg' },
    { title: 'Design UI/UX avec Figma', slug: 'design-uiux-figma', description: 'Maîtrisez Figma', price: 1200, originalPrice: 2000, category: 'design', instructor: { name: 'Sara Design', title: 'UI/UX Designer' }, duration: '30h', lessons: 90, students: 0, rating: 4.9, image: '/images/figma.jpg' }
  ]);
  console.log('✅ Cours créés !');
  process.exit();
}).catch(e => { console.error(e); process.exit(1); });
