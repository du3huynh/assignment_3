<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHealthStore } from '@/stores/health'
import MedicationTracker from '@/components/MedicationTracker.vue'
import HealthSurvey from '@/components/HealthSurvey.vue'
import { useToast } from 'primevue/usetoast'

// Initialize health store and toast
const healthStore = useHealthStore()
const toast = useToast()

// UI state
const activeTab = ref('dashboard')
const showSurvey = ref(false)
const showAppointmentForm = ref(false)
const appointmentFormData = ref({
  doctorName: '',
  speciality: '',
  location: null,
  date: new Date().toISOString().split('T')[0],
  time: '',
  notes: ''
})
const validationErrors = ref({})
const isSubmitting = ref(false)

// Health stats
const healthStats = ref({
  medicationAdherence: 0,
  upcomingAppointments: 0,
  completedSurveys: 0
})

// Activity timeline
const recentActivity = ref([])

// Load user data on component mount
onMounted(async () => {
  try {
    await Promise.all([
      healthStore.fetchMedications(),
      healthStore.fetchAppointments()
    ])
    
    updateHealthStats()
    generateActivityTimeline()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health data. Please try again.',
      life: 5000
    })
  }
})

// Computed properties
const appointments = computed(() => {
  return healthStore.appointments || []
})

const upcomingAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value
    .filter(appt => appt.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const medicationStats = computed(() => {
  const medications = healthStore.medications || []
  const total = medications.length
  const active = medications.filter(med => med.status === 'active').length
  const taken = medications.filter(med => {
    const today = new Date().toISOString().split('T')[0]
    return med.lastTaken && med.lastTaken.startsWith(today)
  }).length
  
  return {
    total,
    active,
    taken,
    adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0
  }
})

// Methods
const updateHealthStats = () => {
  // Calculate medication adherence
  healthStats.value.medicationAdherence = medicationStats.value.adherenceRate
  
  // Count upcoming appointments
  healthStats.value.upcomingAppointments = upcomingAppointments.value.length
  
  // Count completed surveys (this would normally come from the database)
  healthStats.value.completedSurveys = healthStore.healthSurvey ? 1 : 0
}

const generateActivityTimeline = () => {
  const timeline = []
  
  // Add medication activities
  healthStore.medications.forEach(med => {
    if (med.lastTaken) {
      timeline.push({
        type: 'medication',
        action: 'taken',
        item: med.medicationName,
        timestamp: new Date(med.lastTaken),
        details: `Took ${med.dosage} of ${med.medicationName}`
      })
    }
    
    timeline.push({
      type: 'medication',
      action: 'added',
      item: med.medicationName,
      timestamp: new Date(med.createdAt),
      details: `Added ${med.medicationName} to your medications`
    })
  })
  
  // Add appointment activities
  healthStore.appointments.forEach(appt => {
    timeline.push({
      type: 'appointment',
      action: 'scheduled',
      item: appt.doctorName,
      timestamp: new Date(appt.createdAt),
      details: `Scheduled appointment with ${appt.doctorName} on ${new Date(appt.date).toLocaleDateString()}`
    })
  })
  
  // Sort by most recent first
  timeline.sort((a, b) => b.timestamp - a.timestamp)
  
  // Take the 10 most recent activities
  recentActivity.value = timeline.slice(0, 10)
}

const showAppointmentModal = () => {
  showAppointmentForm.value = true
  resetAppointmentForm()
}

const resetAppointmentForm = () => {
  appointmentFormData.value = {
    doctorName: '',
    speciality: '',
    location: null,
    date: new Date().toISOString().split('T')[0],
    time: '',
    notes: ''
  }
  validationErrors.value = {}
}

const validateAppointmentForm = () => {
  const errors = {}
  
  if (!appointmentFormData.value.doctorName.trim()) {
    errors.doctorName = 'Doctor name is required'
  }
  
  if (!appointmentFormData.value.speciality.trim()) {
    errors.speciality = 'Speciality is required'
  }
  
  if (!appointmentFormData.value.date) {
    errors.date = 'Date is required'
  }
  
  if (!appointmentFormData.value.time.trim()) {
    errors.time = 'Time is required'
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveAppointment = async () => {
  if (!validateAppointmentForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const result = await healthStore.addAppointment(appointmentFormData.value)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Appointment scheduled successfully',
        life: 3000
      })
      
      showAppointmentForm.value = false
      updateHealthStats()
      generateActivityTimeline()
    } else {
      throw new Error(result.error || 'Failed to schedule appointment')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

const deleteAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return
  }
  
  try {
    const result = await healthStore.deleteAppointment(appointmentId)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Appointment deleted successfully',
        life: 3000
      })
      
      updateHealthStats()
      generateActivityTimeline()
    } else {
      throw new Error(result.error || 'Failed to delete appointment')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  }
}

const exportHealthData = async (dataType) => {
  try {
    const result = await healthStore.exportData(dataType)
    
    if (result.success && result.data) {
      // Create a download link for the CSV
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `healthy_bytes_${dataType}_${new Date().toISOString().split('T')[0]}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Data exported successfully',
        life: 3000
      })
    } else {
      throw new Error(result.message || 'No data to export')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  }
}

const completeHealthSurvey = async (surveyData) => {
  try {
    const result = await healthStore.saveHealthSurvey(surveyData)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Health survey completed successfully',
        life: 3000
      })
      
      showSurvey.value = false
      updateHealthStats()
      
      // Add survey to activity timeline
      recentActivity.value.unshift({
        type: 'survey',
        action: 'completed',
        item: 'Health Survey',
        timestamp: new Date(),
        details: 'Completed a health survey'
      })
    } else {
      throw new Error(result.error || 'Failed to save health survey')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  }
}

// Handle tab navigation
const setActiveTab = (tab) => {
  activeTab.value = tab
}
</script>

<template>
  <div class="health-dashboard" role="main">
    <h1>My Health Dashboard</h1>
    <p class="lead">Track, manage, and improve your health</p>
    
    <!-- Dashboard Navigation Tabs -->
    <nav class="nav nav-tabs mb-4" role="tablist">
      <a 
        class="nav-link" 
        :class="{ active: activeTab === 'dashboard' }" 
        href="#" 
        @click.prevent="setActiveTab('dashboard')"
        role="tab"
        aria-selected="activeTab === 'dashboard'"
        aria-controls="dashboard-panel"
        id="dashboard-tab"
      >
        Dashboard
      </a>
      <a 
        class="nav-link" 
        :class="{ active: activeTab === 'medications' }" 
        href="#" 
        @click.prevent="setActiveTab('medications')"
        role="tab"
        aria-selected="activeTab === 'medications'"
        aria-controls="medications-panel"
        id="medications-tab"
      >
        Medications
      </a>
      <a 
        class="nav-link" 
        :class="{ active: activeTab === 'appointments' }" 
        href="#" 
        @click.prevent="setActiveTab('appointments')"
        role="tab"
        aria-selected="activeTab === 'appointments'"
        aria-controls="appointments-panel"
        id="appointments-tab"
      >
        Appointments
      </a>
      <a 
        class="nav-link" 
        :class="{ active: activeTab === 'survey' }" 
        href="#" 
        @click.prevent="setActiveTab('survey')"
        role="tab"
        aria-selected="activeTab === 'survey'"
        aria-controls="survey-panel"
        id="survey-tab"
      >
        Health Survey
      </a>
    </nav>
    
    <!-- Dashboard Content -->
    <div 
      role="tabpanel" 
      id="dashboard-panel"
      :aria-labelledby="'dashboard-tab'"
      v-show="activeTab === 'dashboard'"
    >
      <!-- Health Stats Summary -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card h-100 dashboard-card">
            <div class="card-body text-center">
              <i class="bi bi-capsule fs-1 mb-3 text-primary" aria-hidden="true"></i>
              <h3>Medication Adherence</h3>
              <div class="display-4 mb-2">{{ healthStats.medicationAdherence }}%</div>
              <p>Medications taken as scheduled</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card h-100 dashboard-card">
            <div class="card-body text-center">
              <i class="bi bi-calendar-check fs-1 mb-3 text-primary" aria-hidden="true"></i>
              <h3>Upcoming Appointments</h3>
              <div class="display-4 mb-2">{{ healthStats.upcomingAppointments }}</div>
              <p>Scheduled appointments</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card h-100 dashboard-card">
            <div class="card-body text-center">
              <i class="bi bi-clipboard-check fs-1 mb-3 text-primary" aria-hidden="true"></i>
              <h3>Health Survey</h3>
              <div class="display-4 mb-2">{{ healthStats.completedSurveys }}</div>
              <p>{{ healthStats.completedSurveys > 0 ? 'Survey completed' : 'Survey not completed' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="mb-4">
        <h2>Quick Actions</h2>
        <div class="d-flex flex-wrap gap-2">
          <button 
            @click="setActiveTab('medications')" 
            class="btn btn-primary"
            aria-label="Manage medications"
          >
            <i class="bi bi-capsule me-2" aria-hidden="true"></i>
            Manage Medications
          </button>
          
          <button 
            @click="showAppointmentModal"
            class="btn btn-success"
            aria-label="Schedule appointment"
          >
            <i class="bi bi-calendar-plus me-2" aria-hidden="true"></i>
            Schedule Appointment
          </button>
          
          <button 
            @click="setActiveTab('survey')"
            class="btn btn-info text-white"
            aria-label="Complete health survey"
          >
            <i class="bi bi-clipboard-plus me-2" aria-hidden="true"></i>
            Complete Health Survey
          </button>
          
          <button 
            @click="exportHealthData('all')"
            class="btn btn-outline-secondary"
            aria-label="Export all health data"
          >
            <i class="bi bi-download me-2" aria-hidden="true"></i>
            Export All Data
          </button>
        </div>
      </div>
      
      <!-- Activity Timeline -->
      <div class="mb-4">
        <h2>Recent Activity</h2>
        <div class="card">
          <div class="card-body p-0">
            <ul class="list-group list-group-flush activity-timeline">
              <li v-if="recentActivity.length === 0" class="list-group-item py-3">
                <p class="mb-0 text-muted">No recent activity</p>
              </li>
              
              <li v-for="(activity, index) in recentActivity" :key="index" class="list-group-item py-3">
                <div class="d-flex">
                  <div class="activity-icon me-3">
                    <i 
                      :class="{
                        'bi bi-capsule': activity.type === 'medication',
                        'bi bi-calendar-check': activity.type === 'appointment',
                        'bi bi-clipboard-check': activity.type === 'survey'
                      }"
                      class="fs-5"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                      <h5 class="mb-1">{{ activity.details }}</h5>
                      <small class="text-muted">{{ activity.timestamp.toLocaleString() }}</small>
                    </div>
                    <p class="mb-0 text-muted">
                      {{ 
                        activity.type === 'medication' ? 'Medication' : 
                        activity.type === 'appointment' ? 'Appointment' : 'Survey'
                      }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Upcoming Appointments Preview -->
      <div class="mb-4">
        <h2>Upcoming Appointments</h2>
        <div class="card">
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-if="upcomingAppointments.length === 0" class="list-group-item py-3">
                <p class="mb-0 text-muted">No upcoming appointments</p>
              </li>
              
              <li 
                v-for="appointment in upcomingAppointments.slice(0, 3)" 
                :key="appointment.id"
                class="list-group-item py-3"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-1">{{ appointment.doctorName }}</h5>
                    <p class="mb-0">{{ appointment.speciality }}</p>
                    <small class="text-muted">
                      {{ new Date(appointment.date).toLocaleDateString() }} at {{ appointment.time }}
                    </small>
                  </div>
                  <div>
                    <a 
                      href="#" 
                      @click.prevent="setActiveTab('appointments')"
                      class="btn btn-sm btn-outline-primary"
                      aria-label="View all appointments"
                    >
                      Details
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer" v-if="upcomingAppointments.length > 3">
            <a 
              href="#" 
              @click.prevent="setActiveTab('appointments')"
              class="text-decoration-none"
              aria-label="View all appointments"
            >
              View all appointments
              <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Medications Panel -->
    <div 
      role="tabpanel" 
      id="medications-panel"
      :aria-labelledby="'medications-tab'"
      v-show="activeTab === 'medications'"
    >
      <MedicationTracker />
    </div>
    
    <!-- Appointments Panel -->
    <div 
      role="tabpanel" 
      id="appointments-panel"
      :aria-labelledby="'appointments-tab'"
      v-show="activeTab === 'appointments'"
    >
      <div class="appointments-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>My Appointments</h2>
          <div class="action-buttons">
            <button 
              @click="showAppointmentModal" 
              class="btn btn-primary"
              aria-label="Schedule new appointment"
            >
              <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
              Schedule Appointment
            </button>
            
            <button 
              @click="exportHealthData('appointments')" 
              class="btn btn-outline-secondary ms-2"
              aria-label="Export appointments"
              :disabled="appointments.length === 0"
            >
              <i class="bi bi-download me-1" aria-hidden="true"></i>
              Export
            </button>
          </div>
        </div>
        
        <!-- Appointments List -->
        <div class="card">
          <div class="card-body p-0">
            <div v-if="healthStore.loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p>Loading appointments...</p>
            </div>
            
            <div v-else-if="appointments.length === 0" class="text-center py-4">
              <p>No appointments scheduled</p>
              <button 
                @click="showAppointmentModal" 
                class="btn btn-primary"
                aria-label="Schedule your first appointment"
              >
                Schedule Your First Appointment
              </button>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Doctor</th>
                    <th scope="col">Specialty</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appointment in appointments" :key="appointment.id">
                    <td>{{ appointment.doctorName }}</td>
                    <td>{{ appointment.speciality }}</td>
                    <td>{{ new Date(appointment.date).toLocaleDateString() }}</td>
                    <td>{{ appointment.time }}</td>
                    <td>
                      <span v-if="appointment.notes">{{ appointment.notes }}</span>
                      <span v-else class="text-muted">No notes</span>
                    </td>
                    <td>
                      <div class="btn-group" role="group" aria-label="Appointment actions">
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click="deleteAppointment(appointment.id)"
                          aria-label="Delete appointment"
                        >
                          <i class="bi bi-trash" aria-hidden="true"></i>
                          <span class="visually-hidden">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Health Survey Panel -->
    <div 
      role="tabpanel" 
      id="survey-panel"
      :aria-labelledby="'survey-tab'"
      v-show="activeTab === 'survey'"
    >
      <HealthSurvey @survey-completed="completeHealthSurvey" />
    </div>
    
    <!-- Appointment Modal -->
    <div v-if="showAppointmentForm" class="modal-backdrop" @click="showAppointmentForm = false"></div>
    <div v-if="showAppointmentForm" class="modal-dialog modal-dialog-centered" role="dialog" aria-labelledby="appointmentModalTitle">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title" id="appointmentModalTitle">Schedule Appointment</h3>
          <button 
            type="button" 
            class="btn-close" 
            @click="showAppointmentForm = false"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAppointment" novalidate>
            <div class="mb-3">
              <label for="doctorName" class="form-label">Doctor Name <span class="text-danger">*</span></label>
              <input 
                type="text" 
                id="doctorName" 
                v-model="appointmentFormData.doctorName" 
                class="form-control" 
                :class="{ 'is-invalid': validationErrors.doctorName }"
                aria-describedby="doctorNameHelp doctorNameError"
                required
              />
              <div id="doctorNameHelp" class="form-text">Enter the name of your doctor</div>
              <div 
                v-if="validationErrors.doctorName" 
                id="doctorNameError" 
                class="invalid-feedback"
              >
                {{ validationErrors.doctorName }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="speciality" class="form-label">Speciality <span class="text-danger">*</span></label>
              <input 
                type="text" 
                id="speciality" 
                v-model="appointmentFormData.speciality" 
                class="form-control" 
                :class="{ 'is-invalid': validationErrors.speciality }"
                aria-describedby="specialityHelp specialityError"
                required
              />
              <div id="specialityHelp" class="form-text">E.g., Cardiologist, Dermatologist</div>
              <div 
                v-if="validationErrors.speciality" 
                id="specialityError" 
                class="invalid-feedback"
              >
                {{ validationErrors.speciality }}
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="date" class="form-label">Date <span class="text-danger">*</span></label>
                <input 
                  type="date" 
                  id="date" 
                  v-model="appointmentFormData.date" 
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.date }"
                  aria-describedby="dateHelp dateError"
                  required
                />
                <div id="dateHelp" class="form-text">Select appointment date</div>
                <div 
                  v-if="validationErrors.date" 
                  id="dateError" 
                  class="invalid-feedback"
                >
                  {{ validationErrors.date }}
                </div>
              </div>
              
              <div class="col-md-6 mb-3">
                <label for="time" class="form-label">Time <span class="text-danger">*</span></label>
                <input 
                  type="time" 
                  id="time" 
                  v-model="appointmentFormData.time" 
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.time }"
                  aria-describedby="timeHelp timeError"
                  required
                />
                <div id="timeHelp" class="form-text">Select appointment time</div>
                <div 
                  v-if="validationErrors.time" 
                  id="timeError" 
                  class="invalid-feedback"
                >
                  {{ validationErrors.time }}
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="notes" class="form-label">Notes</label>
              <textarea 
                id="notes" 
                v-model="appointmentFormData.notes" 
                class="form-control"
                rows="3"
                aria-describedby="notesHelp"
                placeholder="Any additional notes about this appointment"
              ></textarea>
              <div id="notesHelp" class="form-text">Optional notes for this appointment</div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="showAppointmentForm = false"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="saveAppointment"
            :disabled="isSubmitting"
            aria-label="Save appointment"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Save Appointment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-card {
  transition: transform 0.3s;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-card:hover {
  transform: translateY(-5px);
}

.activity-timeline .activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 95%;
  z-index: 1050;
}

/* Tab Styles */
.nav-tabs .nav-link {
  color: #495057;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-tabs .nav-link:focus {
  outline: 3px solid #4285F4;
  outline-offset: -3px;
  z-index: 2;
}

/* High contrast focus indicators for accessibility */
:focus {
  outline: 3px solid #4285F4;
  outline-offset: 2px;
}

/* Ensure text has sufficient color contrast */
.text-muted {
  color: #6c757d !important;
}

/* Visually hidden elements for screen readers */
.visually-hidden {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons button {
    margin-bottom: 0.5rem;
    width: 100%;
  }
  
  .modal-dialog {
    width: 95%;
  }
}
</style>