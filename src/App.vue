<template>
  <div id="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppHeader />
    <main id="main-content">
      <router-view />
    </main>
    <AppFooter />
    <OfflineIndicator />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
// import AppHeader from './components/AppHeader.vue'
// import AppFooter from './components/AppFooter.vue'
// import OfflineIndicator from './components/OfflineIndicator.vue'

export default defineComponent({
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    OfflineIndicator,
  },
})
</script>
