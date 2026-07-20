import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaPLqJ6gkbaunRaR9WA0mVwxQw-TooBMg",
  authDomain: "gen-lang-client-0676055838.firebaseapp.com",
  projectId: "gen-lang-client-0676055838",
  appId: "1:470700196079:web:2ddb8e9b194bf9626c5b1a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, "ai-studio-voiceagentbuilde-49d60089-d04c-4ee8-a68c-15f8844a9979");
