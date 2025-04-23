import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const useHealthStore = defineStore('health', () => {
  // State
  const medications = ref([]);
  const appointments = ref([]);
  const healthSurvey = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Firebase instances
  const db = getFirestore();
  const auth = getAuth();
  const functions = getFunctions();

  // Cloud function callable references
  const createMedicationReminder = httpsCallable(functions, 'createMedicationReminder');
  const scheduleAppointment = httpsCallable(functions, 'scheduleAppointment');
  const exportHealthData = httpsCallable(functions, 'exportHealthData');

  // Getters (computed)
  const upcomingAppointments = computed(() => {
    // Sort appointments by date (nearest first)
    return [...appointments.value].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  });

  const todayMedications = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return medications.value.filter(med => {
      // Filter medications that need to be taken today
      // This is simplified - real implementation would check frequency
      return med.nextDose && med.nextDose.startsWith(today);
    });
  });

  // Actions
  async function fetchMedications() {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'medicationReminders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      medications.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error fetching medications:', err);
      error.value = 'Failed to load medications. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchAppointments() {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      appointments.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error fetching appointments:', err);
      error.value = 'Failed to load appointments. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  async function addMedication(medicationData) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await createMedicationReminder(medicationData);
      
      if (result.data.success) {
        await fetchMedications();
        return { success: true, id: result.data.id };
      } else {
        throw new Error(result.data.message || 'Failed to add medication');
      }
    } catch (err) {
      console.error('Error adding medication:', err);
      error.value = err.message || 'Failed to add medication. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function addAppointment(appointmentData) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await scheduleAppointment(appointmentData);
      
      if (result.data.success) {
        await fetchAppointments();
        return { success: true, id: result.data.id };
      } else {
        throw new Error(result.data.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      error.value = err.message || 'Failed to schedule appointment. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateMedication(id, medicationData) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'medicationReminders', id);
      await updateDoc(docRef, medicationData);
      await fetchMedications();
      return { success: true };
    } catch (err) {
      console.error('Error updating medication:', err);
      error.value = 'Failed to update medication. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteMedication(id) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'medicationReminders', id);
      await deleteDoc(docRef);
      medications.value = medications.value.filter(med => med.id !== id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting medication:', err);
      error.value = 'Failed to delete medication. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateAppointment(id, appointmentData) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, appointmentData);
      await fetchAppointments();
      return { success: true };
    } catch (err) {
      console.error('Error updating appointment:', err);
      error.value = 'Failed to update appointment. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteAppointment(id) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'appointments', id);
      await deleteDoc(docRef);
      appointments.value = appointments.value.filter(appt => appt.id !== id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting appointment:', err);
      error.value = 'Failed to delete appointment. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function saveHealthSurvey(surveyData) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const userId = auth.currentUser.uid;
      
      const surveyRef = collection(db, 'healthSurveys');
      await addDoc(surveyRef, {
        ...surveyData,
        userId,
        createdAt: new Date()
      });
      
      healthSurvey.value = surveyData;
      return { success: true };
    } catch (err) {
      console.error('Error saving health survey:', err);
      error.value = 'Failed to save health survey. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function exportData(dataType) {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await exportHealthData({ dataType });
      
      if (result.data.success) {
        return { 
          success: true, 
          data: result.data.data,
          message: result.data.message
        };
      } else {
        throw new Error(result.data.message || 'Export failed');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      error.value = err.message || 'Failed to export data. Please try again.';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    medications,
    appointments,
    healthSurvey,
    loading,
    error,
    
    // Getters
    upcomingAppointments,
    todayMedications,
    
    // Actions
    fetchMedications,
    fetchAppointments,
    addMedication,
    addAppointment,
    updateMedication,
    updateAppointment,
    deleteMedication,
    deleteAppointment,
    saveHealthSurvey,
    exportData
  };
});