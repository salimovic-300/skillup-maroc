import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data
          set({ user, token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.error || 'Erreur de connexion' 
          }
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data
          set({ user, token, isAuthenticated: true, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.error || 'Erreur d\'inscription' 
          }
        }
      },

      // Logout
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      // Get current user
      fetchUser: async () => {
        const token = get().token
        if (!token) return

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          set({ user: response.data.data, isAuthenticated: true })
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      // Update user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

export const useCourseStore = create((set) => ({
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  isLoading: false,
  filters: {
    category: '',
    level: '',
    search: ''
  },

  // Fetch all courses
  fetchCourses: async (params = {}) => {
    set({ isLoading: true })
    try {
      const response = await api.get('/courses', { params })
      set({ courses: response.data.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // Fetch featured courses
  fetchFeaturedCourses: async () => {
    try {
      const response = await api.get('/courses/featured')
      set({ featuredCourses: response.data.data })
    } catch (error) {
      console.error('Error fetching featured courses:', error)
    }
  },

  // Fetch single course
  fetchCourse: async (slug) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/courses/${slug}`)
      set({ currentCourse: response.data.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...filters } })
  },

  // Clear current course
  clearCurrentCourse: () => {
    set({ currentCourse: null })
  }
}))
