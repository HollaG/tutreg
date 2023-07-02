// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { FullInfo } from "../pages/swap/create";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBWfVrRvQzhZGlvYs8qtrislb-79E7qLD4",
    authDomain: "tutreg-9d91c.firebaseapp.com",
    projectId: "tutreg-9d91c",
    storageBucket: "tutreg-9d91c.appspot.com",
    messagingSenderId: "638563662561",
    appId: "1:638563662561:web:a583ce00fc9ca859a255a0",
    measurementId: "G-1PQ1WVQD07",
};

// types
export type Request = FullInfo & {
    status: "new" | "notified" | "deleted";
};

export type SwapReplyRequest = {
    requestorId: number; // Telegram id
    requested: Request;
    lastUpdated: Date;
};

export interface SwapReplies {
    swapId: string;
    requests: SwapReplyRequest[];
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const fireDb = getFirestore(app);
const auth = getAuth(app);

// Sign in
const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;
export const signIn = async () => {
    // console.log({ adminUser, adminPassword, auth: auth.currentUser });
    if (!adminUser || !adminPassword) return false;
    if (auth.currentUser) return true;
    try {
        await signInWithEmailAndPassword(auth, adminUser, adminPassword);

        // make a sample
        const dbRef = doc(fireDb, "test", "123");
        await setDoc(dbRef, { name: "test" });
        console.log("Login tests passed");
        return true;
    } catch (e) {
        console.log("Admin account not found. Creating admin account...");
        try {
            await createUserWithEmailAndPassword(
                auth,
                adminUser,
                adminPassword
            );
        } catch (e) {
            console.log("Admin account could not be created!.");
            return false;
        }
    }
};

export const COLLECTION_NAME = "requests";
