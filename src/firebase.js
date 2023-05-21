import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFw8XyfvAHtRlEsX0cax-hshSRNPzb1Sg",
  authDomain: "gest-tasks.firebaseapp.com",
  projectId: "gest-tasks",
  storageBucket: "gest-tasks.appspot.com",
  messagingSenderId: "108461718889",
  appId: "1:108461718889:web:aa973f1266085eb4e211f8",
  databaseURL: "https://gest-tasks.firebaseio.com/",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
