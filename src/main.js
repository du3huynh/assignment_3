import './assets/main.css'
import './assets/accessibility.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Initialize Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // Replace with your API key
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firestore, Auth, and Functions
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)
const functions = getFunctions(firebaseApp)

// Setup emulators for local development
if (import.meta.env.MODE === 'development') {
  console.log('Using Firebase emulators')

  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log('Connected to Firestore emulator')

    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('Connected to Auth emulator')

    // Connect to Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('Connected to Functions emulator')
  } catch (error) {
    console.error('Error connecting to emulators:', error)
  }
}

// Create and mount the Vue application
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)

// Make Firebase services available to the app
app.config.globalProperties.$firebase = {
  db,
  auth,
  functions,
}

app.mount('#app')
