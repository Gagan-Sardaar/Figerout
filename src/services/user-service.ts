
'use server';
/**
 * @fileOverview A service for managing user data in Firebase Firestore.
 */
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export interface FirestoreUser {
  id: string; // Firestore document ID, which is the Firebase Auth UID
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'inactive' | 'invited';
  phoneNumber?: string;
}

/**
 * Fetches a single user from the 'users' collection in Firestore.
 * @param userId The user's UID.
 */
export async function getUser(userId: string): Promise<FirestoreUser | null> {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as FirestoreUser;
        } else {
            console.log("No such user document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

/**
 * Fetches all users from the 'users' collection in Firestore.
 */
export async function getUsers(): Promise<FirestoreUser[]> {
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef);
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FirestoreUser));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

/**
 * Updates a user's data in Firestore.
 * @param userId The user's UID.
 * @param data The partial data to update.
 */
export async function updateUser(userId: string, data: Partial<Omit<FirestoreUser, 'id'>>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
}
