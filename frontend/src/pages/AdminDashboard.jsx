import { useState, useEffect } from 'react';
import axios from '../utils/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalRevenue: 0, totalEnrollments: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/courses')
      ]);
      setStats(statsRes.data.data || {});
      setUsers(usersRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) { alert('Erreur'); }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
      await axios.delete(`/admin/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) { alert('Erreur'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-300 mt-2">Gérez votre plateforme SkillUp Maroc</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Utilisateurs</p>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Cours</p>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Inscriptions</p>
            <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Revenus</p>
            <p className="text-3xl font-bold">{stats.totalRevenue} DH</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b">
            {['overview', 'users', 'courses'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-medium ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'users' ? 'Utilisateurs' : 'Cours'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <table className="w-full">
                <thead><tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3">Utilisateur</th><th className="pb-3">Email</th><th className="pb-3">Rôle</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b">
                      <td className="py-4 font-medium">{user.profile?.firstName} {user.profile?.lastName}</td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4"><span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>{user.role}</span></td>
                      <td className="py-4"><button onClick={() => handleDeleteUser(user._id)} className="text-red-500 text-sm">Supprimer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'courses' && (
              <table className="w-full">
                <thead><tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3">Cours</th><th className="pb-3">Prix</th><th className="pb-3">Statut</th><th className="pb-3">Actions</th>
                </tr></thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b">
                      <td className="py-4 font-medium">{course.title?.substring(0, 40)}...</td>
                      <td className="py-4">{course.price} DH</td>
                      <td className="py-4"><span className={`px-2 py-1 rounded text-xs ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100'}`}>{course.status}</span></td>
                      <td className="py-4"><button onClick={() => handleDeleteCourse(course._id)} className="text-red-500 text-sm">Supprimer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'overview' && (
              <div className="text-center py-8 text-gray-500">
                <p>📊 Statistiques globales affichées ci-dessus</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
