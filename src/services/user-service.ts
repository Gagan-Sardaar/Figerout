
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
  where,
  limit,
  setDoc,
} from "firebase/firestore";

export interface FirestoreUser {
  id: string; // Firestore document ID, which is the Firebase Auth UID
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'inactive' | 'invited' | 'pending_deletion' | 'blocked';
  phoneNumber?: string;
  deletionScheduledAt?: any; // To allow passing serverTimestamp()
}

/**
 * Creates a new user document in Firestore.
 * @param uid The Firebase Auth UID for the new user.
 * @param data An object containing the user's email and name.
 * @returns The newly created user profile.
 */
export async function createUser(uid: string, data: { email: string; name: string }): Promise<FirestoreUser> {
    const userRef = doc(db, 'users', uid);
    const initials = data.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
        
    const newUser: Omit<FirestoreUser, 'id'> = {
        name: data.name,
        email: data.email.toLowerCase(),
        initials,
        role: 'Viewer',
        status: 'active',
    };

    await setDoc(userRef, newUser);
    return { id: uid, ...newUser };
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

export async function getUserByEmail(email: string): Promise<FirestoreUser | null> {
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("email", "==", email.toLowerCase()), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as FirestoreUser;

    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
}

export async function getBlockedUsers(): Promise<FirestoreUser[]> {
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("status", "==", "blocked"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FirestoreUser));
    } catch (error) {
        console.error("Error fetching blocked users:", error);
        return [];
    }
}
