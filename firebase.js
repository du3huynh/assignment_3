import { initializeApp } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'health-companion-app.firebaseapp.com',
  projectId: 'health-companion-app',
  storageBucket: 'health-companion-app.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const functions = getFunctions(firebaseApp)
export const storage = getStorage(firebaseApp)

// Collection references
export const usersCollection = collection(db, 'users')
export const medicationsCollection = collection(db, 'medications')
export const appointmentsCollection = collection(db, 'appointments')
export const symptomsCollection = collection(db, 'symptoms')
export const servicesCollection = collection(db, 'services')
export const resourcesCollection = collection(db, 'resources')
