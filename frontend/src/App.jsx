import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import MesCours from './pages/MesCours';
import Freelance from './pages/Freelance';
import FreelanceDetail from './pages/FreelanceDetail';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseEditor from './pages/CourseEditor';
import AdminDashboard from './pages/AdminDashboard';
import CoursePlayer from './pages/CoursePlayer';
import About from './pages/About';
import CGV from './pages/CGV';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/formations" element={<Courses />} />
          <Route path="/cours/:slug" element={<CourseDetail />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/connexion" />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/mes-cours" element={isAuthenticated ? <MesCours /> : <Navigate to="/connexion" />} />
          <Route path="/learn/:slug" element={isAuthenticated ? <CoursePlayer /> : <Navigate to="/connexion" />} />
          <Route path="/freelance" element={<Freelance />} />
          <Route path="/freelance/:projectId" element={<FreelanceDetail />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/courses/new" element={<CourseEditor />} />
          <Route path="/instructor/courses/:id/edit" element={<CourseEditor />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/a-propos" element={<About />} />
<Route path="/cgv" element={<CGV />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
