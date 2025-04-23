<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToHealth = () => {
  router.push('/health')
}

const navigateToMaps = () => {
  router.push('/maps')
}
</script>

<template>
  <main>
    <div class="welcome-container">
      <div class="hero-section">
        <h1 class="display-4">Watching your health for you so you don't have to!</h1>
        <p class="lead">Welcome to your own personal health monitor!</p>

        <div class="cta-buttons">
          <button @click="navigateToHealth" class="btn btn-primary btn-lg">Track My Health</button>
          <button @click="navigateToMaps" class="btn btn-outline-primary btn-lg ms-3">
            Find Health Services
          </button>
        </div>
      </div>

      <div class="features-section mt-5">
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="feature-card">
              <i class="bi bi-capsule feature-icon"></i>
              <h3>Medication Tracking</h3>
              <p>
                Never miss a dose with our intuitive medication tracking system. Set reminders,
                track your medication history, and export your data for doctor visits.
              </p>
              <a href="/health" class="feature-link"
                >Manage medications <i class="bi bi-arrow-right"></i
              ></a>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="feature-card">
              <i class="bi bi-calendar-check feature-icon"></i>
              <h3>Health Appointments</h3>
              <p>
                Keep track of all your medical appointments in one place. Schedule new appointments,
                set reminders, and maintain your complete appointment history.
              </p>
              <a href="/health" class="feature-link"
                >Schedule appointments <i class="bi bi-arrow-right"></i
              ></a>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="feature-card">
              <i class="bi bi-geo-alt feature-icon"></i>
              <h3>Find Health Services</h3>
              <p>
                Locate nearby pharmacies, hospitals, and medical professionals. Get directions, save
                favorite locations, and export location data for your records.
              </p>
              <a href="/maps" class="feature-link"
                >Find services <i class="bi bi-arrow-right"></i
              ></a>
            </div>
          </div>
        </div>
      </div>

      <div class="about-section mt-5">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h2>Your Health Companion</h2>
            <p>
              My Health Companion is designed specifically for busy programmers who want to maintain
              a healthy lifestyle while juggling coding projects and deadlines.
            </p>
            <p>
              Our application provides an accessible, data-driven approach to health management with
              features that integrate seamlessly into your daily routine.
            </p>
            <ul class="feature-list">
              <li>
                <i class="bi bi-check-circle"></i> WCAG 2.1 AA compliant for complete accessibility
              </li>
              <li>
                <i class="bi bi-check-circle"></i> Export your health data in multiple formats
              </li>
              <li><i class="bi bi-check-circle"></i> Cloud-based storage for access anywhere</li>
              <li>
                <i class="bi bi-check-circle"></i> Responsive design works on all your devices
              </li>
            </ul>
            <a href="/about" class="btn btn-outline-primary">Learn More</a>
          </div>
          <div class="col-md-6">
            <img
              src="https://retinalscreenings.com/wp-content/uploads/2022/02/AdobeStock_317687329-2048x1024.jpeg"
              alt="Health dashboard illustration"
              class="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>

      <div class="testimonials-section mt-5">
        <h2 class="text-center mb-4">What Our Users Say</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>
                  "This app has completely changed how I manage my health as a developer. The
                  medication tracking feature is a lifesaver!"
                </p>
              </div>
              <div class="testimonial-author">
                <p class="mb-0"><strong>Sarah J.</strong></p>
                <p class="text-muted">Full Stack Developer</p>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>
                  "I love how I can find healthcare providers nearby using the maps feature. It's
                  incredibly convenient when traveling for work."
                </p>
              </div>
              <div class="testimonial-author">
                <p class="mb-0"><strong>Michael T.</strong></p>
                <p class="text-muted">Software Engineer</p>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>
                  "The accessibility features make this app stand out. I can adjust everything to my
                  specific needs, from font size to contrast settings."
                </p>
              </div>
              <div class="testimonial-author">
                <p class="mb-0"><strong>Alex K.</strong></p>
                <p class="text-muted">Frontend Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section mt-5 text-center">
        <h2>Start Your Health Journey Today</h2>
        <p class="lead">
          Join thousands of programmers who are prioritizing their health alongside their code.
        </p>
        <button @click="navigateToHealth" class="btn btn-primary btn-lg">Get Started Now</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.welcome-container {
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  padding: 3rem 0;
}

.hero-section h1 {
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-buttons {
  margin-top: 2rem;
}

.feature-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #0d6efd;
  margin-bottom: 1rem;
}

.feature-link {
  display: inline-block;
  margin-top: 1rem;
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.feature-link:hover {
  text-decoration: underline;
}

.feature-list {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
}

.feature-list li {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.feature-list i {
  color: #28a745;
  margin-right: 0.5rem;
}

.testimonial-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  font-style: italic;
  margin-bottom: 1rem;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
}

.cta-section {
  background-color: #f8f9fa;
  padding: 3rem;
  border-radius: 10px;
}

/* Responsive styles */
@media (max-width: 767px) {
  .hero-section {
    padding: 2rem 0;
  }

  .hero-section h1 {
    font-size: 1.8rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }

  .cta-buttons .btn {
    width: 100%;
    margin-bottom: 1rem;
  }

  .cta-buttons .btn.ms-3 {
    margin-left: 0 !important;
  }

  .about-section .col-md-6:first-child {
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .welcome-container {
    padding: 1rem 0;
  }

  .hero-section h1 {
    font-size: 1.5rem;
  }

  .feature-card,
  .testimonial-card {
    padding: 1rem;
  }

  .cta-section {
    padding: 1.5rem;
  }

  .cta-section h2 {
    font-size: 1.5rem;
  }

  .cta-section .lead {
    font-size: 1rem;
  }
}
</style>
