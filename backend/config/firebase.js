import admin from "firebase-admin";

console.log("DEBUG project_id:", JSON.stringify(process.env.FIREBASE_PROJECT_ID));
console.log("DEBUG client_email:", JSON.stringify(process.env.FIREBASE_CLIENT_EMAIL));
console.log("DEBUG key exists:", !!process.env.FIREBASE_PRIVATE_KEY);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Render escaped newlines from the .env file correctly
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export default admin;
