/**
 * Performs an accessibility audit on the current page and logs issues to the console
 * This is useful during development to identify accessibility issues
 */
export function runAccessibilityAudit() {
  // Check for images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])')
  if (imagesWithoutAlt.length > 0) {
    console.warn('Accessibility issue: Found images without alt text', imagesWithoutAlt)
  }

  // Check for inputs without labels
  const inputs = document.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (!label) {
        console.warn('Accessibility issue: Input without associated label', input)
      }
    } else if (!input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
      console.warn('Accessibility issue: Input without id, aria-label, or aria-labelledby', input)
    }
  })

  // Check for buttons without accessible names
  const buttonsWithoutText = document.querySelectorAll('button')
  buttonsWithoutText.forEach((button) => {
    if (
      !button.textContent.trim() &&
      !button.hasAttribute('aria-label') &&
      !button.hasAttribute('aria-labelledby') &&
      !button.querySelector('*')
    ) {
      console.warn('Accessibility issue: Button without accessible name', button)
    }
  })

  // Check for color contrast (this is a basic check, a full check requires more complex logic)
  console.info(
    'Accessibility reminder: Ensure all text has sufficient color contrast with its background',
  )

  // Check for headings in the correct order
  let previousLevel = 0
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1))
    if (previousLevel > 0 && level > previousLevel + 1) {
      console.warn(
        `Accessibility issue: Heading levels should not be skipped. Found ${heading.tagName} after ${previousLevel}`,
        heading,
      )
    }
    previousLevel = level
  })

  // Check for missing lang attribute on html
  if (!document.documentElement.hasAttribute('lang')) {
    console.warn('Accessibility issue: The html element is missing a lang attribute')
  }

  console.info(
    'Accessibility audit complete. Fix any warnings to improve compliance with WCAG 2.1 AA.',
  )
}

/**
 * Creates a skip-to-content link for keyboard users
 * Should be called in the App.vue's onMounted hook
 */
export function addSkipToContentLink() {
  // Create the skip link
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.className = 'skip-to-content'
  skipLink.textContent = 'Skip to main content'

  // Style the skip link (these styles are also in accessibility.css, but we set them here to ensure they work)
  skipLink.style.position = 'absolute'
  skipLink.style.top = '-40px'
  skipLink.style.left = '0'
  skipLink.style.background = '#0d6efd'
  skipLink.style.color = 'white'
  skipLink.style.padding = '8px'
  skipLink.style.zIndex = '9999'
  skipLink.style.transition = 'top 0.3s'

  // Add focus and blur event listeners
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  // Insert the skip link at the beginning of the body
  document.body.insertBefore(skipLink, document.body.firstChild)

  // Ensure the main content has an ID to jump to
  const mainContent = document.querySelector('main') || document.querySelector('.main-content')
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content'
  }
}

/**
 * Ensures focus is trapped within a modal dialog for keyboard users
 * @param {HTMLElement} modalElement - The modal dialog element
 */
export function trapFocusInModal(modalElement) {
  // Find all focusable elements in the modal
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  // Focus the first element when the modal opens
  firstElement.focus()

  // Handle tabbing to keep focus within the modal
  modalElement.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Shift + Tab pressed
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      }
      // Tab pressed
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    // Close on Escape
    if (e.key === 'Escape') {
      // This should trigger your modal close function
      // You'll need to adapt this to your modal implementation
      const closeButton = modalElement.querySelector('.close-button, .btn-close')
      if (closeButton) {
        closeButton.click()
      }
    }
  })
}

/**
 * Announces messages to screen readers using an ARIA live region
 * @param {string} message - The message to announce
 * @param {string} type - The type of announcement ('assertive' or 'polite')
 */
export function announceToScreenReader(message, type = 'polite') {
  // Create or get the live region
  let announcer = document.getElementById('screen-reader-announcer')

  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'screen-reader-announcer'
    announcer.className = 'sr-only'
    announcer.setAttribute('aria-live', type)
    announcer.setAttribute('aria-atomic', 'true')
    document.body.appendChild(announcer)
  } else {
    announcer.setAttribute('aria-live', type)
  }

  // Set the message
  announcer.textContent = message

  // Clear the announcer after a delay
  setTimeout(() => {
    announcer.textContent = ''
  }, 3000)
}

/**
 * Checks if high contrast mode is enabled in the user's operating system
 * @returns {boolean} Whether high contrast mode is enabled
 */
export function isHighContrastModeEnabled() {
  // Check using matchMedia if the browser supports it
  if (window.matchMedia) {
    // Most modern browsers
    if (window.matchMedia('(forced-colors: active)').matches) {
      return true
    }
    // Older browsers
    if (window.matchMedia('(-ms-high-contrast: active)').matches) {
      return true
    }
  }
  return false
}
