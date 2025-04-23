<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHealthStore } from '@/stores/health'

// References for form input and Google Maps data
const fromLocation = ref('')
const searchRadius = ref(5) // Default search radius in km
const searchType = ref('pharmacy') // Default search type
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])
const placesService = ref(null)
const directionsService = ref(null)
const directionsRenderer = ref(null)
const nearbyPlaces = ref([])
const selectedPlace = ref(null)
const loading = ref(false)
const error = ref(null)

// Use the health store
const healthStore = useHealthStore()

// Get user's saved appointments to display on the map
const userAppointments = computed(() => {
  return healthStore.appointments.filter(
    (app) => app.location && app.location.lat && app.location.lng,
  )
})

// Initialize Google Maps and Places Service
onMounted(async () => {
  try {
    loading.value = true

    // Load user data
    await healthStore.fetchAppointments()

    // Initialize map if Google Maps API is loaded
    if (window.google) {
      // Create the map
      map.value = new window.google.maps.Map(mapContainer.value, {
        center: { lat: -37.8136, lng: 144.9631 }, // Default to Melbourne CBD
        zoom: 13,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        },
      })

      // Create a Places service
      placesService.value = new google.maps.places.PlacesService(map.value)

      // Create Directions service
      directionsService.value = new google.maps.DirectionsService()
      directionsRenderer.value = new google.maps.DirectionsRenderer({
        map: map.value,
        suppressMarkers: false,
      })

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            map.value.setCenter(pos)

            // Add a marker for user's location
            const marker = new google.maps.Marker({
              position: pos,
              map: map.value,
              title: 'Your Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            })

            markers.value.push(marker)
            fromLocation.value = `${pos.lat},${pos.lng}`
          },
          () => {
            error.value = 'Error: The Geolocation service failed.'
          },
        )
      } else {
        error.value = "Error: Your browser doesn't support geolocation."
      }

      // Show user's appointments on the map
      displayAppointmentLocations()
    } else {
      error.value =
        'Google Maps API is not loaded. Please check your API key and network connection.'
    }
  } catch (err) {
    error.value = `Error initializing map: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
})

/**
 * Display the user's appointment locations on the map
 */
const displayAppointmentLocations = () => {
  if (!map.value || userAppointments.value.length === 0) return

  // Clear previous appointment markers
  clearMarkers()

  userAppointments.value.forEach((appointment) => {
    if (appointment.location && appointment.location.lat && appointment.location.lng) {
      const marker = new google.maps.Marker({
        position: {
          lat: appointment.location.lat,
          lng: appointment.location.lng,
        },
        map: map.value,
        title: `Appointment: ${appointment.doctorName}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      })

      // Add info window with appointment details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div>
            <h3>${appointment.doctorName}</h3>
            <p>Specialty: ${appointment.speciality}</p>
            <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
            <p>Time: ${appointment.time}</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(map.value, marker)
      })

      markers.value.push(marker)
    }
  })
}

/**
 * Search for nearby health facilities
 */
const searchNearbyPlaces = () => {
  if (!map.value || !placesService.value) return

  loading.value = true
  error.value = null
  nearbyPlaces.value = []

  try {
    // Clear previous search markers
    clearMarkers()

    // Get location from input or use map center
    let location
    if (fromLocation.value) {
      const [lat, lng] = fromLocation.value.split(',').map((coord) => parseFloat(coord.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        location = new google.maps.LatLng(lat, lng)
      }
    }

    if (!location) {
      location = map.value.getCenter()
    }

    // Define the search request
    const request = {
      location: location,
      radius: searchRadius.value * 1000, // Convert km to meters
      type: searchType.value,
    }

    // Perform the search
    placesService.value.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Store the results
        nearbyPlaces.value = results

        // Add markers for each place
        results.forEach((place, i) => {
          if (place.geometry && place.geometry.location) {
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: map.value,
              title: place.name,
              label: (i + 1).toString(),
              animation: google.maps.Animation.DROP,
            })

            // Add info window with place details
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div>
                  <h3>${place.name}</h3>
                  <p>Rating: ${place.rating ? `${place.rating}/5` : 'N/A'}</p>
                  <p>Address: ${place.vicinity}</p>
                </div>
              `,
            })

            marker.addListener('click', () => {
              infoWindow.open(map.value, marker)
              selectedPlace.value = place
            })

            markers.value.push(marker)
          }
        })

        // Adjust map bounds to show all results
        const bounds = new google.maps.LatLngBounds()
        results.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            bounds.extend(place.geometry.location)
          }
        })
        bounds.extend(location)
        map.value.fitBounds(bounds)
      } else {
        error.value = `Place search failed: ${status}`
      }

      loading.value = false
    })
  } catch (err) {
    error.value = `Error searching for places: ${err.message}`
    loading.value = false
  }
}

/**
 * Get directions to the selected place
 */
const getDirections = (place) => {
  if (!map.value || !directionsService.value || !directionsRenderer.value) return

  try {
    loading.value = true
    error.value = null

    // Get origin from input or use map center
    let origin
    if (fromLocation.value) {
      const [lat, lng] = fromLocation.value.split(',').map((coord) => parseFloat(coord.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        origin = new google.maps.LatLng(lat, lng)
      }
    }

    if (!origin) {
      origin = map.value.getCenter()
    }

    // Define the directions request
    const request = {
      origin: origin,
      destination: place.geometry.location,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    }

    // Get directions
    directionsService.value.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Hide existing markers
        markers.value.forEach((marker) => marker.setMap(null))

        // Display the directions
        directionsRenderer.value.setDirections(result)

        // Set selected place
        selectedPlace.value = place
      } else {
        error.value = `Directions request failed: ${status}`
        selectedPlace.value = null
      }

      loading.value = false
    })
  } catch (err) {
    error.value = `Error getting directions: ${err.message}`
    loading.value = false
  }
}

/**
 * Reset the map and clear directions
 */
const resetMap = () => {
  // Clear directions
  if (directionsRenderer.value) {
    directionsRenderer.value.setMap(null)
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map.value,
    })
  }

  // Clear markers
  clearMarkers()

  // Reset selected place
  selectedPlace.value = null

  // Re-display appointment locations
  displayAppointmentLocations()

  // Re-center map based on user location if available
  if (fromLocation.value) {
    const [lat, lng] = fromLocation.value.split(',').map((coord) => parseFloat(coord.trim()))
    if (!isNaN(lat) && !isNaN(lng)) {
      map.value.setCenter({ lat, lng })
      map.value.setZoom(13)
    }
  }
}

/**
 * Clear all markers from the map
 */
const clearMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []
}

/**
 * Function to export locations as CSV
 */
const exportLocationsCSV = () => {
  if (nearbyPlaces.value.length === 0) {
    error.value = 'No places to export. Please perform a search first.'
    return
  }

  try {
    // Create CSV headers
    let csv = 'Name,Address,Latitude,Longitude,Rating,Types\n'

    // Add each place to the CSV
    nearbyPlaces.value.forEach((place) => {
      const name = place.name ? `"${place.name.replace(/"/g, '""')}"` : ''
      const address = place.vicinity ? `"${place.vicinity.replace(/"/g, '""')}"` : ''
      const lat = place.geometry?.location.lat() || ''
      const lng = place.geometry?.location.lng() || ''
      const rating = place.rating || ''
      const types = place.types ? `"${place.types.join(', ')}"` : ''

      csv += `${name},${address},${lat},${lng},${rating},${types}\n`
    })

    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'nearby_health_locations.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    error.value = `Error exporting locations: ${err.message}`
  }
}
</script>

<template>
  <div class="map-view" aria-label="Map and health locations finder">
    <h1>Find Health Locations</h1>
    <p>Search for pharmacies, hospitals, or doctors near you</p>

    <!-- Accessibility announcement for screen readers -->
    <div class="sr-only" aria-live="polite">
      {{ error ? error : loading ? 'Loading map data...' : 'Map is ready' }}
    </div>

    <!-- Search Form with accessibility features -->
    <div class="search-controls" role="search">
      <div class="input-group mb-3">
        <label for="fromLocation" class="visually-hidden">Your Location (latitude,longitude)</label>
        <input
          id="fromLocation"
          v-model="fromLocation"
          class="form-control"
          placeholder="Your Location (latitude,longitude)"
          aria-label="Your Location"
          aria-describedby="locationHelp"
        />
        <small id="locationHelp" class="form-text"
          >Format: latitude,longitude (e.g., -37.8136,144.9631)</small
        >
      </div>

      <div class="input-group mb-3">
        <label for="searchRadius" class="form-label">Search Radius (km)</label>
        <input
          id="searchRadius"
          v-model="searchRadius"
          type="number"
          min="1"
          max="50"
          class="form-control"
          aria-label="Search radius in kilometers"
        />
      </div>

      <div class="input-group mb-3">
        <label for="searchType" class="form-label">Location Type</label>
        <select
          id="searchType"
          v-model="searchType"
          class="form-select"
          aria-label="Select location type to search for"
        >
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="doctor">Doctor</option>
          <option value="health">Health</option>
        </select>
      </div>

      <div class="button-group">
        <button
          @click="searchNearbyPlaces"
          class="btn btn-primary me-2"
          aria-label="Search for nearby health locations"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Search
        </button>

        <button @click="resetMap" class="btn btn-secondary" aria-label="Reset map view">
          Reset
        </button>

        <button
          @click="exportLocationsCSV"
          class="btn btn-success ms-2"
          aria-label="Export search results as CSV file"
          :disabled="nearbyPlaces.length === 0"
        >
          Export Results (CSV)
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-danger mt-3" role="alert">
      {{ error }}
    </div>

    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="map-container mt-3"
      aria-label="Google Map showing health locations"
      role="application"
      tabindex="0"
    ></div>

    <!-- Results Display -->
    <div class="row mt-4">
      <!-- List of places -->
      <div class="col-md-6">
        <h2>Nearby Locations</h2>
        <p v-if="loading">Searching for locations...</p>
        <p v-else-if="nearbyPlaces.length === 0">No locations found. Try adjusting your search.</p>

        <ul class="list-group" v-else>
          <li
            v-for="(place, index) in nearbyPlaces"
            :key="index"
            class="list-group-item"
            :class="{ active: selectedPlace && selectedPlace.place_id === place.place_id }"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5>{{ index + 1 }}. {{ place.name }}</h5>
                <p class="mb-1">{{ place.vicinity }}</p>
                <p class="mb-1" v-if="place.rating">Rating: {{ place.rating }}/5</p>
              </div>
              <div>
                <button
                  @click="getDirections(place)"
                  class="btn btn-sm btn-primary"
                  aria-label="Get directions to this location"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Selected place details -->
      <div class="col-md-6" v-if="selectedPlace">
        <h2>Selected Location Details</h2>
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ selectedPlace.name }}</h5>
            <p class="card-text">Address: {{ selectedPlace.vicinity }}</p>
            <p class="card-text" v-if="selectedPlace.rating">
              Rating: {{ selectedPlace.rating }}/5
            </p>
            <p class="card-text" v-if="selectedPlace.types">
              Categories: {{ selectedPlace.types.join(', ') }}
            </p>
            <button
              @click="getDirections(selectedPlace)"
              class="btn btn-primary"
              aria-label="Get directions to selected location"
            >
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  padding: 20px;
}

.map-container {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.search-controls {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

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

/* High contrast focus indicators for accessibility */
:focus {
  outline: 3px solid #4285f4;
  outline-offset: 2px;
}

/* Ensure text has sufficient color contrast */
.btn-primary {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-success {
  background-color: #218838;
  border-color: #1e7e34;
}

/* Large click targets for touch interfaces */
.btn {
  padding: 8px 16px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
  }

  .button-group button {
    margin-bottom: 10px;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>
