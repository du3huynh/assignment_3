import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import HomePage from '../views/HomePage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import HealthToolsPage from '../views/HealthToolsPage.vue'
import CommunityPage from '../views/CommunityPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import MedicationsManager from '../views/health-tools/MedicationsManager.vue'
import AppointmentsCalendar from '../views/health-tools/AppointmentsCalendar.vue'
import SymptomJournal from '../views/health-tools/SymptomJournal.vue'
import ServiceLocator from '../views/health-tools/ServiceLocator.vue'
import HealthLibrary from '../views/health-tools/HealthLibrary.vue'
import NotFoundPage from '../views/NotFoundPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/health-tools',
    name: 'HealthTools',
    component: HealthToolsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'medications',
        name: 'Medications',
        component: MedicationsManager,
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: AppointmentsCalendar,
      },
      {
        path: 'symptoms',
        name: 'Symptoms',
        component: SymptomJournal,
      },
      {
        path: 'services',
        name: 'Services',
        component: ServiceLocator,
      },
      {
        path: 'library',
        name: 'Library',
        component: HealthLibrary,
      },
    ],
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

// Navigation guard for authentication
router.beforeEach(async (to, from) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()

    // If user is not logged in, redirect to login
    if (!currentUser) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }

    // Check if the route requires admin role
    if (to.meta.requiresAdmin) {
      // TODO: Check if current user has admin role
      // This would be implemented in a real application
      // For now, we'll assume the check passes
    }
  }
})

export default router
