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
