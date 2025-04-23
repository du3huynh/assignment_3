// File: src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MyHealthView from '../views/MyHealthView.vue'
import MapView from '@/views/MapView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/health',
      name: 'health',
      component: MyHealthView,
      meta: { requiresAuth: true },
    },
    {
      path: '/maps',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true'

  // If route requires authentication and user is not authenticated
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    // Redirect to login page
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
