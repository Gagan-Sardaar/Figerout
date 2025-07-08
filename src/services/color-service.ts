/**
 * @fileOverview A service for managing user-saved colors using Firebase Firestore.
 */
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";

export type SavedColor = {
    id?: string; // Firestore document ID
    hex: string;
    name: string;
    sharedAt: string; // Storing as ISO string on the client
    note?: string;
}

// Get the collection reference for a user's colors
const colorsCollectionRef = (userId: string) => collection(db, 'users', userId, 'colors');

export async function getSavedColors(userId: string): Promise<SavedColor[]> {
    if (!userId) return [];
    
    try {
        const q = query(colorsCollectionRef(userId), orderBy("sharedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const sharedAtTimestamp = data.sharedAt as Timestamp;
            return {
                id: doc.id,
                hex: data.hex,
                name: data.name,
                sharedAt: sharedAtTimestamp?.toDate ? sharedAtTimestamp.toDate().toISOString() : new Date().toISOString(),
                note: data.note,
            };
        });
    } catch (error) {
        console.error("Error fetching saved colors:", error);
        return [];
    }
}

/**
 * Sets up a real-time listener for a user's saved colors.
 * @param userId The user's ID.
 * @param callback The function to call with the updated colors array.
 * @returns An unsubscribe function to clean up the listener.
 */
export function onSavedColorsChange(
    userId: string,
    callback: (colors: SavedColor[]) => void
): () => void {
    if (!userId) {
        return () => {}; // Return an empty unsubscribe function
    }

    const q = query(colorsCollectionRef(userId), orderBy("sharedAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const colors = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const sharedAtTimestamp = data.sharedAt as Timestamp;
            return {
                id: doc.id,
                hex: data.hex,
                name: data.name,
                sharedAt: sharedAtTimestamp?.toDate ? sharedAtTimestamp.toDate().toISOString() : new Date().toISOString(),
                note: data.note,
            };
        });
        callback(colors);
    }, (error) => {
        console.error("Error listening to saved colors:", error);
    });

    return unsubscribe;
}

export async function saveColor(userId: string, color: Omit<SavedColor, 'sharedAt' | 'id'>): Promise<SavedColor> {
    // Firestore will use the hex code as the document ID for easy lookup and to prevent duplicates
    const docRef = doc(colorsCollectionRef(userId), color.hex.toUpperCase());
    
    const newColorData = {
        ...color,
        sharedAt: serverTimestamp(),
    };

    await setDoc(docRef, newColorData, { merge: true });

    return { ...color, sharedAt: new Date().toISOString(), id: docRef.id };
}

export async function deleteColor(userId: string, colorHex: string): Promise<void> {
    const docRef = doc(colorsCollectionRef(userId), colorHex.toUpperCase());
    await deleteDoc(docRef);
}

export async function updateColorNote(userId: string, colorHex: string, note: string): Promise<void> {
    const docRef = doc(colorsCollectionRef(userId), colorHex.toUpperCase());
    await updateDoc(docRef, { note });
}

export async function deleteAllColors(userId: string): Promise<void> {
    if (!userId) return;

    try {
        const userColorsRef = colorsCollectionRef(userId);
        const querySnapshot = await getDocs(userColorsRef);
        
        // This is fine for a small number of documents.
        // For larger scale, batched writes or a Cloud Function would be better.
        const deletePromises = querySnapshot.docs.map((docSnapshot) => deleteDoc(doc(userColorsRef, docSnapshot.id)));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error deleting all colors for user:", error);
        throw new Error("Could not delete user's colors.");
    }
}
