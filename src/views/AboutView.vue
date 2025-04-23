<script setup>
// No additional script needed for the about page
</script>

<template>
  <div class="about-page">
    <div class="container">
      <section class="about-header">
        <h1>About My Health Companion</h1>
        <p class="lead">
          Empowering programmers and tech professionals to prioritize health alongside code.
        </p>
      </section>

      <section class="about-mission">
        <div class="row">
          <div class="col-lg-12">
            <h2>Our Mission</h2>
            <p>
              At My Health Companion, we believe that maintaining good health is as important as
              maintaining good code. Our mission is to create technology that helps developers and
              tech professionals balance their busy work schedules with proper health management.
            </p>
            <p>
              We understand the unique challenges that come with a career in technology – long hours
              sitting at a desk, irregular schedules, and the constant pressure to meet deadlines.
              That's why we've built a comprehensive health management platform specifically
              designed for the tech community.
            </p>
          </div>
        </div>
      </section>

      <section class="about-features">
        <h2 class="mb-4">Key Features</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="feature-box">
              <div class="feature-icon">
                <i class="bi bi-capsule"></i>
              </div>
              <h3>Medication Management</h3>
              <ul>
                <li>Set personalized medication reminders</li>
                <li>Track medication adherence and history</li>
                <li>Export health data for medical appointments</li>
                <li>Organize prescriptions and refill dates</li>
              </ul>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="feature-box">
              <div class="feature-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <h3>Health Appointments</h3>
              <ul>
                <li>Schedule and manage medical appointments</li>
                <li>Set reminders with customizable notifications</li>
                <li>Store doctor information and visit notes</li>
                <li>Track appointment history and outcomes</li>
              </ul>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="feature-box">
              <div class="feature-icon">
                <i class="bi bi-geo-alt"></i>
              </div>
              <h3>Health Location Services</h3>
              <ul>
                <li>Find nearby pharmacies, clinics, and hospitals</li>
                <li>Get directions to health service locations</li>
                <li>Save and categorize favorite health providers</li>
                <li>Export location data for future reference</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="about-tech">
        <h2>Technology & Accessibility</h2>
        <div class="row">
          <div class="col-lg-12">
            <div class="tech-box">
              <h3>Built with Modern Technology</h3>
              <p>
                My Health Companion is built using modern web technologies to ensure a seamless,
                responsive experience across all devices. We've implemented:
              </p>
              <ul>
                <li><strong>Vue.js</strong> - For a reactive, component-based user interface</li>
                <li>
                  <strong>Firebase</strong> - For secure cloud storage and serverless functions
                </li>
                <li>
                  <strong>Google Maps API</strong> - For accurate location services and mapping
                </li>
                <li>
                  <strong>Responsive Design</strong> - For optimal viewing on any device, from
                  desktop to mobile
                </li>
              </ul>

              <h3 class="mt-4">Accessibility First</h3>
              <p>
                We're committed to making health management accessible to everyone. Our application
                meets WCAG 2.1 AA accessibility standards, featuring:
              </p>
              <ul>
                <li>Keyboard navigability for users who cannot use a mouse</li>
                <li>Screen reader compatibility for visually impaired users</li>
                <li>Adjustable font sizes and high contrast modes</li>
                <li>Reduced motion settings for users sensitive to animations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="about-team">
        <h2>Our Team</h2>
        <p class="mb-4">
          My Health Companion was developed by a team of healthcare professionals, developers, and
          designers who understand the unique health challenges faced by the tech community.
        </p>

        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="team-member">
              <h3>Jane Smith</h3>
              <p class="role">Founder & Lead Developer</p>
              <p>
                Jane combines 10 years of software development experience with a passion for health
                tech. After experiencing burnout early in her career, she became dedicated to
                creating tools that help developers maintain both their code quality and their
                health.
              </p>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="team-member">
              <h3>Michael Johnson</h3>
              <p class="role">Healthcare Advisor</p>
              <p>
                Dr. Johnson brings clinical expertise to the team with a background in occupational
                health. He specializes in addressing health issues common among tech workers, from
                repetitive strain injuries to stress management.
              </p>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="team-member">
              <h3>Sarah Chen</h3>
              <p class="role">UX Designer</p>
              <p>
                Sarah's expertise in accessible design ensures that My Health Companion is not only
                beautiful but also usable by everyone. She works tirelessly to create interfaces
                that are intuitive and adaptive to different user needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-contact">
        <div class="contact-box">
          <h2>Get in Touch</h2>
          <p>
            We're always looking to improve our application based on user feedback. If you have
            questions, suggestions, or need support, please reach out to us!
          </p>
          <div class="contact-info">
            <p>
              <i class="bi bi-envelope"></i> Email:
              <a href="mailto:support@myhealthcompanion.com">support@myhealthcompanion.com</a>
            </p>
            <p>
              <i class="bi bi-github"></i> GitHub:
              <a href="https://github.com/myhealthcompanion" target="_blank"
                >github.com/myhealthcompanion</a
              >
            </p>
            <p>
              <i class="bi bi-twitter"></i> Twitter:
              <a href="https://twitter.com/myhealthcomp" target="_blank">@myhealthcomp</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: 2rem 0;
}

section {
  margin-bottom: 4rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.about-header h1 {
  color: #0d6efd;
  font-weight: 700;
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.25rem;
  color: #6c757d;
}

h2 {
  color: #0d6efd;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.feature-box {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-box:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #0d6efd;
  margin-bottom: 1rem;
  text-align: center;
}

.feature-box h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #343a40;
}

.feature-box ul {
  padding-left: 1.5rem;
}

.feature-box li {
  margin-bottom: 0.5rem;
}

.tech-box {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tech-box h3 {
  color: #0d6efd;
  margin-bottom: 1rem;
}

.tech-box ul {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.tech-box li {
  margin-bottom: 0.5rem;
}

.team-member {
  text-align: left;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  border-left: 4px solid #0d6efd;
}

.team-member h3 {
  color: #0d6efd;
  margin-bottom: 0.25rem;
}

.role {
  font-style: italic;
  color: #6c757d;
  margin-bottom: 1rem;
}

.contact-box {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
}

.contact-info p {
  margin-bottom: 0.5rem;
}

.contact-info i {
  margin-right: 0.5rem;
  color: #0d6efd;
}

/* Responsive styles */
@media (max-width: 767px) {
  .about-page {
    padding: 1rem 0;
  }

  section {
    margin-bottom: 3rem;
  }

  .about-header {
    padding: 1.5rem;
  }

  .about-header h1 {
    font-size: 1.8rem;
  }

  .lead {
    font-size: 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .tech-box,
  .feature-box,
  .team-member {
    padding: 1.25rem;
  }
}
</style>
