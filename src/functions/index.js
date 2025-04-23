const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Cloud function to add a medication reminder
exports.createMedicationReminder = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a reminder"
    );
  }

  const { medicationName, dosage, frequency, time, notes } = data;
  const userId = context.auth.uid;

  try {
    const reminderRef = await admin.firestore().collection("medicationReminders").add({
      userId,
      medicationName,
      dosage,
      frequency,
      time,
      notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      id: reminderRef.id,
      message: "Medication reminder created successfully",
    };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Cloud function to schedule an appointment
exports.scheduleAppointment = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to schedule an appointment"
    );
  }

  const { doctorName, speciality, location, date, time, notes } = data;
  const userId = context.auth.uid;

  try {
    const appointmentRef = await admin.firestore().collection("appointments").add({
      userId,
      doctorName,
      speciality,
      location,
      date,
      time,
      notes,
      status: "scheduled",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      id: appointmentRef.id,
      message: "Appointment scheduled successfully",
    };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Cloud function to export user health data as CSV
exports.exportHealthData = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to export data"
    );
  }

  const userId = context.auth.uid;
  const { dataType } = data; // 'medications' or 'appointments'

  try {
    let collectionRef;
    if (dataType === "medications") {
      collectionRef = admin.firestore().collection("medicationReminders");
    } else if (dataType === "appointments") {
      collectionRef = admin.firestore().collection("appointments");
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid data type specified"
      );
    }

    const snapshot = await collectionRef.where("userId", "==", userId).get();
    
    if (snapshot.empty) {
      return {
        success: true,
        data: "",
        message: "No data found to export",
      };
    }

    // Format the data as CSV
    let csvData = [];
    let headers = [];

    // Extract headers from the first document
    const firstDoc = snapshot.docs[0].data();
    headers = Object.keys(firstDoc).filter(key => key !== "userId");
    csvData.push(headers.join(","));

    // Add data rows
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const row = headers.map(header => {
        let cell = data[header];
        // Format timestamps or objects
        if (cell && typeof cell === "object") {
          if (cell.toDate) {
            cell = cell.toDate().toISOString();
          } else {
            cell = JSON.stringify(cell);
          }
        }
        // Escape commas in the cell value
        return `"${cell}"`;
      });
      csvData.push(row.join(","));
    });

    return {
      success: true,
      data: csvData.join("\n"),
      message: "Data exported successfully",
    };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Function to notify users about upcoming appointments
exports.sendAppointmentReminders = functions.pubsub.schedule("every day 08:00").onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  
  const tomorrowTimestamp = admin.firestore.Timestamp.fromDate(tomorrow);
  
  try {
    const snapshot = await admin.firestore()
      .collection("appointments")
      .where("status", "==", "scheduled")
      .where("date", "<=", tomorrowTimestamp)
      .where("date", ">", now)
      .get();
    
    const reminderPromises = [];
    
    snapshot.forEach(doc => {
      const appointment = doc.data();
      const userId = appointment.userId;
      
      // Here you would typically integrate with a notification service
      // For demonstration, we're just updating a 'notified' field
      reminderPromises.push(
        doc.ref.update({
          notified: true,
          notifiedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      );
      
      // You could send an email or push notification here
      console.log(`Reminder sent to user ${userId} for appointment on ${appointment.date}`);
    });
    
    await Promise.all(reminderPromises);
    return null;
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
    return null;
  }
});