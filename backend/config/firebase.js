import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

console.log("DEBUG project_id:", JSON.stringify(projectId));
console.log("DEBUG client_email:", JSON.stringify(clientEmail));
console.log("DEBUG key exists:", !!rawKey);
console.log("DEBUG key length:", rawKey?.length);

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: rawKey?.includes("\\n")
          ? rawKey.replace(/\\n/g, "\n")
          : rawKey,
      }),
    });
  }
  console.log("DEBUG: Firebase initialized OK");
} catch (err) {
  console.error("FIREBASE INIT ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
}

export default admin;
