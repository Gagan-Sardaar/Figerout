
'use server';
/**
 * @fileOverview A service for managing static page content using Firebase Firestore.
 */
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export interface PageContent {
  id: string; // slug
  pageTitle: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  pageContent: string; // Markdown content
  lastUpdated: Date;
}

export type PageContentData = Omit<PageContent, 'id' | 'lastUpdated'>;

// The collection will be 'pages' and each document ID will be the slug (e.g., 'about-us')
const pageDocRef = (pageSlug: string) => doc(db, 'pages', pageSlug);

/**
 * Saves or updates the content for a specific page.
 * @param pageSlug The unique identifier for the page (e.g., 'about-us').
 * @param content The page content object to save.
 */
export async function savePageContent(pageSlug: string, content: PageContentData): Promise<void> {
    try {
        const docRef = pageDocRef(pageSlug);
        await setDoc(docRef, {
            ...content,
            lastUpdated: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error(`Error saving page content for ${pageSlug}:`, error);
        throw new Error('Failed to save page content.');
    }
}

/**
 * Fetches the content for a specific page.
 * @param pageSlug The unique identifier for the page.
 * @returns The page content object or null if not found.
 */
export async function getPageContent(pageSlug: string): Promise<PageContent | null> {
    try {
        const docRef = pageDocRef(pageSlug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastUpdatedTimestamp = data.lastUpdated as Timestamp;
            return {
                id: docSnap.id,
                pageTitle: data.pageTitle,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                focusKeywords: data.focusKeywords,
                pageContent: data.pageContent,
                lastUpdated: lastUpdatedTimestamp?.toDate ? lastUpdatedTimestamp.toDate() : new Date(),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching page content for ${pageSlug}:`, error);
        return null;
    }
}
