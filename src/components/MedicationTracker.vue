<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHealthStore } from '@/stores/health'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import { generateMedicationPDFContent } from '@/utils/reportGenerator'

const healthStore = useHealthStore()
const toast = useToast()

// Form data for new medications
const newMedication = ref({
  medicationName: '',
  dosage: '',
  frequency: 'daily',
  time: '',
  notes: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: ''
})

// UI state
const isAddingMedication = ref(false)
const isEditingMedication = ref(false)
const editingMedicationId = ref(null)
const exportFormat = ref('csv')
const isExporting = ref(false)

// Validation state
const validationErrors = ref({})

// Load medications on component mount
onMounted(async () => {
  await healthStore.fetchMedications()
})

// Computed properties
const medications = computed(() => {
  return healthStore.medications
})

const medicationsByDate = computed(() => {
  // Group medications by date for easier display
  const grouped = {}
  
  medications.value.forEach(med => {
    const today = new Date().toISOString().split('T')[0]
    const nextDose = med.nextDose || today
    
    if (!grouped[nextDose]) {
      grouped[nextDose] = []
    }
    
    grouped[nextDose].push(med)
  })
  
  return grouped
})

const todaysMedications = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return medicationsByDate.value[today] || []
})

// Methods
const showAddMedicationForm = () => {
  isAddingMedication.value = true
  isEditingMedication.value = false
  resetNewMedicationForm()
}

const resetNewMedicationForm = () => {
  newMedication.value = {
    medicationName: '',
    dosage: '',
    frequency: 'daily',
    time: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  }
  validationErrors.value = {}
}

const cancelAddMedication = () => {
  isAddingMedication.value = false
  isEditingMedication.value = false
  resetNewMedicationForm()
}

const validateMedicationForm = () => {
  const errors = {}
  
  if (!newMedication.value.medicationName.trim()) {
    errors.medicationName = 'Medication name is required'
  }
  
  if (!newMedication.value.dosage.trim()) {
    errors.dosage = 'Dosage is required'
  }
  
  if (!newMedication.value.time.trim()) {
    errors.time = 'Time is required'
  }
  
  if (newMedication.value.endDate && newMedication.value.startDate > newMedication.value.endDate) {
    errors.endDate = 'End date must be after start date'
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveMedication = async () => {
  if (!validateMedicationForm()) {
    return
  }
  
  try {
    // Calculate next dose based on frequency and start date
    let nextDose = newMedication.value.startDate
    
    // Prepare medication data
    const medicationData = {
      medicationName: newMedication.value.medicationName,
      dosage: newMedication.value.dosage,
      frequency: newMedication.value.frequency,
      time: newMedication.value.time,
      notes: newMedication.value.notes,
      startDate: newMedication.value.startDate,
      endDate: newMedication.value.endDate || null,
      nextDose: nextDose,
      status: 'active'
    }
    
    let result
    
    if (isEditingMedication.value && editingMedicationId.value) {
      // Update existing medication
      result = await healthStore.updateMedication(editingMedicationId.value, medicationData)
      
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Medication updated successfully',
          life: 3000
        })
      } else {
        throw new Error(result.error || 'Failed to update medication')
      }
    } else {
      // Add new medication
      result = await healthStore.addMedication(medicationData)
      
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Medication added successfully',
          life: 3000
        })
      } else {
        throw new Error(result.error || 'Failed to add medication')
      }
    }
    
    // Reset form and hide it
    cancelAddMedication()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  }
}

const editMedication = (medication) => {
  isEditingMedication.value = true
  isAddingMedication.value = true
  editingMedicationId.value = medication.id
  
  newMedication.value = {
    medicationName: medication.medicationName,
    dosage: medication.dosage,
    frequency: medication.frequency || 'daily',
    time: medication.time,
    notes: medication.notes || '',
    startDate: medication.startDate || new Date().toISOString().split('T')[0],
    endDate: medication.endDate || ''
  }
  
  // Scroll to form
  setTimeout(() => {
    document.getElementById('medicationForm').scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const deleteMedication = async (medicationId) => {
  if (!confirm('Are you sure you want to delete this medication?')) {
    return
  }
  
  try {
    const result = await healthStore.deleteMedication(medicationId)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Medication deleted successfully',
        life: 3000
      })
    } else {
      throw new Error(result.error || 'Failed to delete medication')
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

const markMedicationTaken = async (medicationId) => {
  try {
    const medication = medications.value.find(med => med.id === medicationId)
    if (!medication) return
    
    // Update medication with new record
    const now = new Date()
    const takenRecord = {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      status: 'taken'
    }
    
    // Calculate next dose based on frequency
    let nextDoseDate = new Date()
    switch (medication.frequency) {
      case 'daily':
        nextDoseDate.setDate(nextDoseDate.getDate() + 1)
        break
      case 'twice-daily':
        // For twice daily, add 12 hours
        nextDoseDate.setHours(nextDoseDate.getHours() + 12)
        break
      case 'weekly':
        nextDoseDate.setDate(nextDoseDate.getDate() + 7)
        break
      case 'monthly':
        nextDoseDate.setMonth(nextDoseDate.getMonth() + 1)
        break
      default:
        nextDoseDate.setDate(nextDoseDate.getDate() + 1)
    }
    
    const nextDose = nextDoseDate.toISOString().split('T')[0]
    
    // Update medication data
    const medicationData = {
      ...medication,
      lastTaken: now.toISOString(),
      nextDose: nextDose,
      history: [...(medication.history || []), takenRecord]
    }
    
    const result = await healthStore.updateMedication(medicationId, medicationData)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Medication marked as taken',
        life: 3000
      })
    } else {
      throw new Error(result.error || 'Failed to update medication status')
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

const exportMedications = async () => {
  try {
    isExporting.value = true
    
    if (exportFormat.value === 'csv') {
      // Export to CSV
      const result = await healthStore.exportData('medications')
      
      if (result.success && result.data) {
        // Create a download link for the CSV
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `medications_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Medications exported successfully',
          life: 3000
        })
      } else {
        throw new Error(result.message || 'No data to export')
      }
    } else if (exportFormat.value === 'pdf') {
      // Export to PDF using browser's print functionality
      // Create a printable version of the medications
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        throw new Error('Please allow popups to export as PDF')
      }
      
      // Generate the HTML content using the utility function
      const htmlContent = generateMedicationPDFContent(medications.value)
      
      printWindow.document.open()
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'PDF report generated. Please use your browser\'s print dialog to save as PDF.',
        life: 5000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="medication-tracker" role="region" aria-label="Medication Tracker">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 id="medicationTitle">My Medications</h2>
      <div class="action-buttons">
        <button 
          @click="showAddMedicationForm" 
          class="btn btn-primary"
          aria-label="Add new medication"
        >
          <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
          Add Medication
        </button>
        
        <div class="export-controls d-inline-block ms-2">
          <div class="btn-group" role="group" aria-label="Export options">
            <select 
              v-model="exportFormat" 
              class="form-select form-select-sm"
              aria-label="Select export format"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button 
              @click="exportMedications" 
              class="btn btn-outline-secondary"
              :disabled="isExporting || medications.length === 0"
              aria-label="Export medications in selected format"
            >
              <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-download me-1" aria-hidden="true"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Form for adding/editing medications -->
    <div v-if="isAddingMedication" id="medicationForm" class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h3 class="card-title mb-0">{{ isEditingMedication ? 'Edit Medication' : 'Add New Medication' }}</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveMedication" novalidate>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="medicationName" class="form-label">Medication Name <span class="text-danger">*</span></label>
              <input 
                type="text" 
                id="medicationName" 
                v-model="newMedication.medicationName" 
                class="form-control" 
                :class="{ 'is-invalid': validationErrors.medicationName }"
                aria-describedby="medicationNameHelp medicationNameError"
                required
              />
              <div id="medicationNameHelp" class="form-text">Enter the name of your medication</div>
              <div 
                v-if="validationErrors.medicationName" 
                id="medicationNameError" 
                class="invalid-feedback"
              >
                {{ validationErrors.medicationName }}
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="dosage" class="form-label">Dosage <span class="text-danger">*</span></label>
              <input 
                type="text" 
                id="dosage" 
                v-model="newMedication.dosage" 
                class="form-control" 
                :class="{ 'is-invalid': validationErrors.dosage }"
                aria-describedby="dosageHelp dosageError"
                required
                placeholder="e.g., 50mg, 1 tablet"
              />
              <div id="dosageHelp" class="form-text">Enter the dosage (e.g., 10mg, 1 pill)</div>
              <div 
                v-if="validationErrors.dosage" 
                id="dosageError" 
                class="invalid-feedback"
              >
                {{ validationErrors.dosage }}
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="frequency" class="form-label">Frequency <span class="text-danger">*</span></label>
              <select 
                id="frequency" 
                v-model="newMedication.frequency" 
                class="form-select"
                aria-describedby="frequencyHelp"
                required
              >
                <option value="daily">Daily</option>
                <option value="twice-daily">Twice Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="as-needed">As Needed</option>
              </select>
              <div id="frequencyHelp" class="form-text">How often to take this medication</div>
            </div>
            
            <div class="col-md-4 mb-3">
              <label for="time" class="form-label">Time <span class="text-danger">*</span></label>
              <input 
                type="time" 
                id="time" 
                v-model="newMedication.time" 
                class="form-control" 
                :class="{ 'is-invalid': validationErrors.time }"
                aria-describedby="timeHelp timeError"
                required
              />
              <div id="timeHelp" class="form-text">When to take this medication</div>
              <div 
                v-if="validationErrors.time" 
                id="timeError" 
                class="invalid-feedback"
              >
                {{ validationErrors.time }}
              </div>
            </div>
            
            <div class="col-md-4 mb-3">
              <label for="startDate" class="form-label">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                v-model="newMedication.startDate" 
                class="form-control"
                aria-describedby="startDateHelp"
              />
              <div id="startDateHelp" class="form-text">When to start taking this medication</div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="endDate" class="form-label">End Date</label>
              <input 
                type="date" 
                id="endDate" 
                v-model="newMedication.endDate" 
                class="form-control"
                :class="{ 'is-invalid': validationErrors.endDate }"
                aria-describedby="endDateHelp endDateError"
              />
              <div id="endDateHelp" class="form-text">When to stop taking this medication (optional)</div>
              <div 
                v-if="validationErrors.endDate" 
                id="endDateError" 
                class="invalid-feedback"
              >
                {{ validationErrors.endDate }}
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="notes" class="form-label">Notes</label>
              <textarea 
                id="notes" 
                v-model="newMedication.notes" 
                class="form-control"
                rows="3"
                aria-describedby="notesHelp"
                placeholder="Additional instructions or notes about this medication"
              ></textarea>
              <div id="notesHelp" class="form-text">Any special instructions (optional)</div>
            </div>
          </div>
          
          <div class="d-flex justify-content-end">
            <button 
              type="button" 
              @click="cancelAddMedication" 
              class="btn btn-outline-secondary me-2"
              aria-label="Cancel adding medication"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              aria-label="Save medication"
            >
              {{ isEditingMedication ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Today's Medications -->
    <div class="card mb-4">
      <div class="card-header">
        <h3 class="card-title">Today's Medications</h3>
      </div>
      <div class="card-body">
        <div v-if="todaysMedications.length === 0" class="text-center py-4">
          <p>No medications scheduled for today</p>
        </div>
        <div v-else class="list-group">
          <div 
            v-for="med in todaysMedications" 
            :key="med.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <h4 class="mb-1">{{ med.medicationName }}</h4>
              <p class="mb-1">{{ med.dosage }} - {{ med.time }}</p>
              <small v-if="med.notes" class="text-muted">{{ med.notes }}</small>
            </div>
            <div>
              <button 
                @click="markMedicationTaken(med.id)" 
                class="btn btn-success btn-sm me-2"
                aria-label="Mark as taken"
              >
                <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
                Taken
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- All Medications -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">All Medications</h3>
      </div>
      <div class="card-body">
        <div v-if="healthStore.loading" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading medications...</p>
        </div>
        
        <div v-else-if="medications.length === 0" class="text-center py-4">
          <p>No medications added yet</p>
          <button 
            @click="showAddMedicationForm" 
            class="btn btn-primary"
            aria-label="Add your first medication"
          >
            Add Your First Medication
          </button>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover" aria-labelledby="medicationTitle">
            <thead>
              <tr>
                <th scope="col">Medication</th>
                <th scope="col">Dosage</th>
                <th scope="col">Frequency</th>
                <th scope="col">Next Dose</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="med in medications" :key="med.id">
                <td>
                  <strong>{{ med.medicationName }}</strong>
                  <div v-if="med.notes" class="small text-muted">{{ med.notes }}</div>
                </td>
                <td>{{ med.dosage }}</td>
                <td>{{ med.frequency }}</td>
                <td>
                  <span v-if="med.nextDose">{{ med.nextDose }}</span>
                  <span v-else class="text-muted">Not scheduled</span>
                </td>
                <td>
                  <div class="btn-group" role="group" aria-label="Medication actions">
                    <button 
                      @click="editMedication(med)" 
                      class="btn btn-outline-primary btn-sm"
                      aria-label="Edit medication"
                    >
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                      <span class="visually-hidden">Edit</span>
                    </button>
                    <button 
                      @click="markMedicationTaken(med.id)" 
                      class="btn btn-outline-success btn-sm"
                      aria-label="Mark medication as taken"
                    >
                      <i class="bi bi-check-lg" aria-hidden="true"></i>
                      <span class="visually-hidden">Mark as taken</span>
                    </button>
                    <button 
                      @click="deleteMedication(med.id)" 
                      class="btn btn-outline-danger btn-sm"
                      aria-label="Delete medication"
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
</template>

<style scoped>
.medication-tracker {
  max-width: 1200px;
  margin: 0 auto;
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

.card-header {
  background-color: #f8f9fa;
}

/* Large click targets for touch interfaces */
.btn {
  padding: 8px 16px;
  font-size: 16px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 14px;
}

/* Add some spacing and improve visual hierarchy */
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.card-header h3 {
  margin-bottom: 0;
}

.form-text {
  font-size: 0.875rem;
}

/* Improve visibility of required fields */
.text-danger {
  font-weight: bold;
}

/* Accessible styles for users with visual impairments */
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
  
  .export-controls {
    margin-top: 10px;
    margin-left: 0 !important;
  }
}
</style>