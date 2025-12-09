// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Navbar from './components/Navbar';  // ← Assure-toi de ça
import Footer from './components/Footer';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Learn from './pages/Learn';


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />  {/* ← La nouvelle navbar */}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/formations" element={<Courses />} />
          <Route path="/cours/:slug" element={<CourseDetail />} />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/connexion" />
            } 
          />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />  
          <Route 
           path="/learn/:courseSlug" 
            element={isAuthenticated ? <Learn /> : <Navigate to="/connexion" />} 
            />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;