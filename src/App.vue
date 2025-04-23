<script setup>
import { useToast } from 'primevue/usetoast'
import { ref, onMounted } from 'vue'
import { addSkipToContentLink } from '@/utils/accessibilityUtils'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()

const showSuccess = (title, description) => {
  toast.add({
    severity: 'success',
    summary: title,
    detail: description,
    life: 3000,
  })
}

import { RouterLink, RouterView } from 'vue-router'
import HealthyEatingTips from './components/HealthyEatingTips.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import FooterSection from '@/components/FooterSection.vue'
import HeroSection from './components/HeroSection.vue'
import Toast from 'primevue/toast'
import LoginView from './views/LoginView.vue'
import AccessibilityControls from './components/AccessibilityControls.vue'

/**
 * The current authentication status of the user.
 * Will be set based on localStorage when the app mounts
 */
const isAuthenticated = ref(false)

/**
 * This function is called when the user logs in or logs out (via the LoginView component using an emit).
 * @param value Boolean indicating authentication status
 */
const handleAuthentication = (value) => {
  console.log('Authentication status changed:', value)
  isAuthenticated.value = value

  if (value) {
    // If user just logged in, redirect to home
    router.push('/')
  } else {
    // If user just logged out, redirect to login
    router.push('/login')
  }
}

// Add skip to content link and other accessibility improvements on mount
onMounted(() => {
  try {
    addSkipToContentLink()
  } catch (error) {
    console.error('Error adding skip to content link:', error)
  }

  // Check for saved authentication state
  const savedAuth = localStorage.getItem('isLoggedIn')
  console.log('Saved authentication state:', savedAuth)
  isAuthenticated.value = savedAuth === 'true'
})
</script>

<template>
  <Toast />

  <div v-if="isAuthenticated">
    <HeaderSection @authenticated="handleAuthentication" />

    <!-- Hide this if the current page is not the Home page -->
    <HeroSection v-if="$route.path === '/'" />

    <div class="container">
      <div class="row">
        <div class="col-9 main-content" id="main-content" role="main">
          <RouterView />
        </div>
        <div class="col-3 sidebar" role="complementary" aria-label="Health tips sidebar">
          <button
            type="button"
            class="btn btn-primary"
            @click="showSuccess('Success', 'You now know how to get a toast working!')"
            aria-label="Show toast notification"
          >
            Show Toast
          </button>
          <HealthyEatingTips />
        </div>
      </div>
    </div>
    <FooterSection />
    <AccessibilityControls />
  </div>

  <!-- If user is not authenticated, show the login view -->
  <div v-else>
    <LoginView @authenticated="handleAuthentication" />
  </div>

  <!-- Screen reader announcer for dynamic content changes -->
  <div id="screen-reader-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
</template>

<style>
/* Import external stylesheets */
@import './assets/accessibility.css';

/* Visually hidden elements for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip to content link styles */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px;
  z-index: 9999;
  transition: top 0.3s;
}

.skip-to-content:focus {
  top: 0;
}

/* High contrast focus indicators for accessibility */
:focus {
  outline: 3px solid #4285f4;
  outline-offset: 2px;
}

/* For improved accessibility, ensure text has sufficient color contrast */
.text-muted {
  color: #6c757d !important;
}
</style>
