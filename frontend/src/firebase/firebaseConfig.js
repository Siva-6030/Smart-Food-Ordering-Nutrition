import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRJWiuXm2oBNezNir83h9ogHlIp4UtBMQ",
  authDomain: "smart-food-ordering-279a1.firebaseapp.com",
  projectId: "smart-food-ordering-279a1",
  storageBucket: "smart-food-ordering-279a1.firebasestorage.app",
  messagingSenderId: "266499790909",
  appId: "1:266499790909:web:6a2695bad915ad0ac1b254",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;