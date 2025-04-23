import { format } from 'date-fns';

/**
 * Generates HTML content for printing medication report as PDF
 * @param {Array} medications - The medications array to include in the report
 * @returns {string} HTML content ready for printing
 */
export function generateMedicationPDFContent(medications) {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medications Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #0056b3; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>Medications Report</h1>
      <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
      
      <table>
        <thead>
          <tr>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Time</th>
            <th>Next Dose</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>`;
  
  // Add each medication to the table
  medications.forEach(med => {
    htmlContent += `
          <tr>
            <td>${med.medicationName}</td>
            <td>${med.dosage}</td>
            <td>${med.frequency}</td>
            <td>${med.time}</td>
            <td>${med.nextDose || 'Not scheduled'}</td>
            <td>${med.notes || ''}</td>
          </tr>`;
  });
  
  // Close the table and document
  htmlContent += `
        </tbody>
      </table>
      
      <div class="footer">
        <p>This report was generated from Healthy Bytes - Your Health Companion</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>`;
  
  return htmlContent;
}

/**
 * Generates HTML content for printing appointment report as PDF
 * @param {Array} appointments - The appointments array to include in the report
 * @returns {string} HTML content ready for printing
 */
export function generateAppointmentPDFContent(appointments) {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointments Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #0056b3; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>Appointments Report</h1>
      <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
      
      <table>
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Specialty</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>`;
  
  // Add each appointment to the table
  appointments.forEach(appt => {
    htmlContent += `
          <tr>
            <td>${appt.doctorName}</td>
            <td>${appt.speciality}</td>
            <td>${new Date(appt.date).toLocaleDateString()}</td>
            <td>${appt.time}</td>
            <td>${appt.location ? 'Specified' : 'Not specified'}</td>
            <td>${appt.notes || ''}</td>
          </tr>`;
  });
  
  // Close the table and document
  htmlContent += `
        </tbody>
      </table>
      
      <div class="footer">
        <p>This report was generated from Healthy Bytes - Your Health Companion</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>`;
  
  return htmlContent;
}