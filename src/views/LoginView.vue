<script setup>
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { defineEmits, onMounted } from 'vue'
import { ref } from 'vue'

/**
 * Firebase imports
 * Import the functions you need from the Firebase SDKs you need
 */
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

const auth = getAuth()
if (import.meta.env.MODE === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('Auth emulator connected')
  } catch (error) {
    console.error('Error connecting to auth emulator:', error)
  }
}

// Form data
const userEmail = ref('')
const userPassword = ref('')
const errorMessage = ref('')
const isProcessing = ref(false)

/**
 * The router instance used for redirecting the user to the home page.
 */
const router = useRouter()
const toast = useToast()

const isLoginMode = ref(true)

/**
 * Emits an event to the parent component to indicate that the user has been authenticated.
 */
const emit = defineEmits(['authenticated'])

/**
 * Shows an error toast message.
 */
const showError = (message) => {
  toast.add({
    severity: 'error',
    summary: message || 'Authentication Error',
    detail: 'Please try again.',
    life: 3000,
  })
}

/**
 * Shows a success toast message.
 */
const showSuccess = (message) => {
  toast.add({
    severity: 'success',
    summary: message,
    detail: 'You are now signed in.',
    life: 3000,
  })
}

/**
 * Handles the form submission.
 * @param {Event} event The form submission event.
 * If the username and password are correct, the user is authenticated and redirected to the home page.
 */
const handleSubmit = (event) => {
  event.preventDefault()
  errorMessage.value = ''
  isProcessing.value = true

  if (isLoginMode.value) {
    // Login box is visible
    firebaseLoginuser(event)
  } else {
    // Register box is visible
    firebaseRegisteruser(event)
  }
}

const toggleLoginMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
}

const firebaseLoginuser = (event) => {
  event.preventDefault()
  userEmail.value = event.target.email.value
  userPassword.value = event.target.password.value

  // For testing - allow login with test credentials
  if (userEmail.value === 'admin@gmail.com' && userPassword.value === 'password') {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userEmail', userEmail.value)
    emit('authenticated', true)
    showSuccess('Login successful')
    isProcessing.value = false
    return
  }

  signInWithEmailAndPassword(auth, userEmail.value, userPassword.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      console.log('User login success:', user)

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', userEmail.value)

      emit('authenticated', true)
      showSuccess('Login successful')
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
      showError(errorMessage)
      console.log(userEmail.value, userPassword.value)
    })
    .finally(() => {
      isProcessing.value = false
    })
}

const firebaseRegisteruser = (event) => {
  event.preventDefault()
  userEmail.value = event.target.email.value
  userPassword.value = event.target.password.value

  createUserWithEmailAndPassword(auth, userEmail.value, userPassword.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      console.log('User registration success:', user)

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', userEmail.value)

      emit('authenticated', true)
      showSuccess('Registration successful')
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
      showError(errorMessage)
    })
    .finally(() => {
      isProcessing.value = false
    })
}

onMounted(() => {
  // Clear any localStorage authentication to ensure login works correctly
  if (import.meta.env.MODE === 'development' && window.location.pathname.includes('login')) {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
  }

  // Check if already logged in
  if (localStorage.getItem('isLoggedIn') === 'true') {
    emit('authenticated', true)
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-box text-center">
      <img
        src="@/assets/logo.svg"
        alt="Health Companion Logo"
        class="logo"
        width="72"
        height="57"
      />
      <h2 class="mb-4" v-if="isLoginMode">Sign In</h2>
      <h2 class="mb-4" v-else>Register</h2>
      <p class="hint" v-if="isLoginMode">
        Hint: The username is 'admin@gmail.com' and the password is 'password'.
      </p>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input
            type="email"
            class="form-control"
            id="email"
            aria-describedby="emailHelp"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" required />
        </div>
        <div class="mb-3 form-check text-start" v-if="isLoginMode">
          <input type="checkbox" class="form-check-input" id="rememberMe" />
          <label class="form-check-label" for="rememberMe">Remember me</label>
        </div>
        <button
          type="submit"
          class="btn btn-primary w-100"
          v-if="isLoginMode"
          :disabled="isProcessing"
        >
          <span
            v-if="isProcessing"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Resume my adventure (Sign in)
        </button>
        <button type="submit" class="btn btn-primary w-100" v-else :disabled="isProcessing">
          <span
            v-if="isProcessing"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          I'm ready for a new adventure!
        </button>
      </form>
      <div class="mt-3" v-if="isLoginMode">
        <a href="#" class="link-secondary">Forgot my password</a> |
        <a href="#" class="link-secondary" @click.prevent="toggleLoginMode">Create an account</a>
      </div>
      <div class="mt-3" v-else>
        <a href="#" class="link-secondary" @click.prevent="toggleLoginMode">Back to Login</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-box {
  max-width: 360px;
  margin: auto;
  padding: 15px;
  border: 1px solid #e3e3e3;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  display: block;
  margin: 0 auto 20px;
}
</style>
