<script setup>
import { ref, watch, onMounted } from 'vue'

// Accessibility settings
const isAccessibilityMenuOpen = ref(false)
const fontSize = ref('medium') // small, medium, large, x-large
const contrast = ref('normal') // normal, high, inverted
const animations = ref(true)
const focusHighlight = ref(true)

// Initialize settings from localStorage on mount
onMounted(() => {
  // Load saved accessibility preferences
  const savedFontSize = localStorage.getItem('accessibility_fontSize')
  const savedContrast = localStorage.getItem('accessibility_contrast')
  const savedAnimations = localStorage.getItem('accessibility_animations')
  const savedFocusHighlight = localStorage.getItem('accessibility_focusHighlight')
  
  if (savedFontSize) fontSize.value = savedFontSize
  if (savedContrast) contrast.value = savedContrast
  if (savedAnimations !== null) animations.value = savedAnimations === 'true'
  if (savedFocusHighlight !== null) focusHighlight.value = savedFocusHighlight === 'true'
  
  // Apply saved settings
  applyFontSize()
  applyContrast()
  applyAnimationSettings()
  applyFocusHighlight()
})

// Watch for changes to settings and persist to localStorage
watch(fontSize, (newValue) => {
  localStorage.setItem('accessibility_fontSize', newValue)
  applyFontSize()
})

watch(contrast, (newValue) => {
  localStorage.setItem('accessibility_contrast', newValue)
  applyContrast()
})

watch(animations, (newValue) => {
  localStorage.setItem('accessibility_animations', String(newValue))
  applyAnimationSettings()
})

watch(focusHighlight, (newValue) => {
  localStorage.setItem('accessibility_focusHighlight', String(newValue))
  applyFocusHighlight()
})

// Apply settings to the document
const applyFontSize = () => {
  document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-x-large')
  document.documentElement.classList.add(`font-${fontSize.value}`)
}

const applyContrast = () => {
  document.documentElement.classList.remove('contrast-normal', 'contrast-high', 'contrast-inverted')
  document.documentElement.classList.add(`contrast-${contrast.value}`)
}

const applyAnimationSettings = () => {
  if (animations.value) {
    document.documentElement.classList.remove('reduce-motion')
  } else {
    document.documentElement.classList.add('reduce-motion')
  }
}

const applyFocusHighlight = () => {
  if (focusHighlight.value) {
    document.documentElement.classList.remove('no-focus-outline')
  } else {
    document.documentElement.classList.add('no-focus-outline')
  }
}

// Toggle accessibility menu
const toggleAccessibilityMenu = () => {
  isAccessibilityMenuOpen.value = !isAccessibilityMenuOpen.value
}

// Reset all settings to defaults
const resetAccessibilitySettings = () => {
  fontSize.value = 'medium'
  contrast.value = 'normal'
  animations.value = true
  focusHighlight.value = true
}
</script>

<template>
  <div class="accessibility-controls">
    <!-- Accessibility Button -->
    <button 
      class="accessibility-button" 
      @click="toggleAccessibilityMenu"
      aria-expanded="isAccessibilityMenuOpen"
      aria-controls="accessibilityMenu"
      aria-label="Accessibility settings"
    >
      <span class="accessibility-icon" aria-hidden="true">
        <i class="bi bi-person-fill"></i>
      </span>
    </button>
    
    <!-- Accessibility Menu -->
    <div 
      id="accessibilityMenu" 
      class="accessibility-menu"
      :class="{ open: isAccessibilityMenuOpen }"
      role="dialog"
      aria-labelledby="accessibilityMenuTitle"
    >
      <div class="accessibility-menu-header">
        <h2 id="accessibilityMenuTitle">Accessibility Settings</h2>
        <button 
          class="close-button" 
          @click="toggleAccessibilityMenu"
          aria-label="Close accessibility settings"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>
      
      <div class="accessibility-menu-body">
        <!-- Text Size Controls -->
        <div class="setting-group">
          <h3 id="fontSizeLabel">Text Size</h3>
          <div class="setting-controls" role="radiogroup" aria-labelledby="fontSizeLabel">
            <div class="radio-option">
              <input 
                type="radio" 
                id="fontSizeSmall" 
                value="small" 
                v-model="fontSize"
                name="fontSize"
              />
              <label for="fontSizeSmall" class="text-small">Small</label>
            </div>
            
            <div class="radio-option">
              <input 
                type="radio" 
                id="fontSizeMedium" 
                value="medium" 
                v-model="fontSize"
                name="fontSize"
              />
              <label for="fontSizeMedium" class="text-medium">Medium</label>
            </div>
            
            <div class="radio-option">
              <input 
                type="radio" 
                id="fontSizeLarge" 
                value="large" 
                v-model="fontSize"
                name="fontSize"
              />
              <label for="fontSizeLarge" class="text-large">Large</label>
            </div>
            
            <div class="radio-option">
              <input 
                type="radio" 
                id="fontSizeXLarge" 
                value="x-large" 
                v-model="fontSize"
                name="fontSize"
              />
              <label for="fontSizeXLarge" class="text-x-large">Extra Large</label>
            </div>
          </div>
        </div>
        
        <!-- Contrast Controls -->
        <div class="setting-group">
          <h3 id="contrastLabel">Color Contrast</h3>
          <div class="setting-controls" role="radiogroup" aria-labelledby="contrastLabel">
            <div class="radio-option">
              <input 
                type="radio" 
                id="contrastNormal" 
                value="normal" 
                v-model="contrast"
                name="contrast"
              />
              <label for="contrastNormal">Normal</label>
            </div>
            
            <div class="radio-option">
              <input 
                type="radio" 
                id="contrastHigh" 
                value="high" 
                v-model="contrast"
                name="contrast"
              />
              <label for="contrastHigh">High Contrast</label>
            </div>
            
            <div class="radio-option">
              <input 
                type="radio" 
                id="contrastInverted" 
                value="inverted" 
                v-model="contrast"
                name="contrast"
              />
              <label for="contrastInverted">Inverted Colors</label>
            </div>
          </div>
        </div>
        
        <!-- Animation Controls -->
        <div class="setting-group">
          <h3 id="animationsLabel">Motion & Animations</h3>
          <div class="setting-controls">
            <div class="switch-option">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="animationsSwitch" 
                  v-model="animations"
                  aria-labelledby="animationsLabel"
                />
                <label class="form-check-label" for="animationsSwitch">
                  {{ animations ? 'Animations enabled' : 'Animations reduced' }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Focus Highlight Controls -->
        <div class="setting-group">
          <h3 id="focusHighlightLabel">Focus Highlighting</h3>
          <div class="setting-controls">
            <div class="switch-option">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="focusHighlightSwitch" 
                  v-model="focusHighlight"
                  aria-labelledby="focusHighlightLabel"
                />
                <label class="form-check-label" for="focusHighlightSwitch">
                  {{ focusHighlight ? 'Focus highlighting enabled' : 'Focus highlighting disabled' }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reset Button -->
        <div class="setting-group">
          <button 
            class="btn btn-outline-secondary w-100" 
            @click="resetAccessibilitySettings"
            aria-label="Reset all accessibility settings to defaults"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accessibility-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.accessibility-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.accessibility-button:hover, 
.accessibility-button:focus {
  background-color: #0b5ed7;
}

.accessibility-icon {
  font-size: 24px;
}

.accessibility-menu {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(20px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  max-height: 80vh;
  overflow-y: auto;
}

.accessibility-menu.open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.accessibility-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.accessibility-menu-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.close-button:hover,
.close-button:focus {
  color: #000;
}

.accessibility-menu-body {
  padding: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
  font-weight: 600;
}

.setting-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.radio-option input[type="radio"] {
  margin-right: 5px;
}

.switch-option {
  width: 100%;
}

/* Text size preview in labels */
.text-small {
  font-size: 12px;
}

.text-medium {
  font-size: 16px;
}

.text-large {
  font-size: 20px;
}

.text-x-large {
  font-size: 24px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .accessibility-menu {
    width: calc(100% - 40px);
    max-width: 320px;
  }
}
</style>