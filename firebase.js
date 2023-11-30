// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
require('dotenv').config();
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx_h9HmjAllyRDppdTi9RUz-JutidPjls",
  authDomain: "todo-5e701.firebaseapp.com",
  projectId: "todo-5e701",
  storageBucket: "todo-5e701.appspot.com",
  messagingSenderId: "488320199317",
  appId: "1:488320199317:web:cdfbe6aa1114142551499c",
  measurementId: "G-L4JMV347GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);