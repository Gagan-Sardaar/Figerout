/**
 * @fileOverview A service for managing user-saved colors.
 *
 * This is a placeholder service. In a real application, you would replace
 * the localStorage logic with calls to a database like Firestore to enable
 * cross-device syncing. The functions are async to mimic database calls.
 */

export type SavedColor = {
    hex: string;
    name: string;
    sharedAt: string;
    note?: string;
}

function getStorageKey(userEmail: string): string {
    return `savedColors_${userEmail}`;
}

// NOTE: The following functions interact with localStorage and will only work on the client.

export async function getSavedColors(userEmail: string): Promise<SavedColor[]> {
    if (typeof window === 'undefined') return [];
    try {
        const storageKey = getStorageKey(userEmail);
        const storedColors = window.localStorage.getItem(storageKey);
        return storedColors ? (JSON.parse(storedColors) as SavedColor[]) : [];
    } catch (e) {
        console.error("Failed to parse saved colors from localStorage", e);
        return [];
    }
}

export async function saveColor(userEmail: string, color: Omit<SavedColor, 'sharedAt' | 'note'>): Promise<SavedColor> {
    if (typeof window === 'undefined') {
        throw new Error("Cannot save color on the server");
    }
    const storageKey = getStorageKey(userEmail);
    const existingColors = await getSavedColors(userEmail);
    
    const newColor: SavedColor = {
        ...color,
        sharedAt: new Date().toISOString()
    };

    if (!existingColors.some(c => c.hex.toUpperCase() === newColor.hex.toUpperCase())) {
        const updatedColors = [newColor, ...existingColors];
        window.localStorage.setItem(storageKey, JSON.stringify(updatedColors));
    }
    
    return newColor;
}

export async function deleteColor(userEmail: string, colorHex: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const storageKey = getStorageKey(userEmail);
    const existingColors = await getSavedColors(userEmail);
    const updatedColors = existingColors.filter(c => c.hex.toUpperCase() !== colorHex.toUpperCase());
    window.localStorage.setItem(storageKey, JSON.stringify(updatedColors));
}

export async function updateColorNote(userEmail: string, colorHex: string, note: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const storageKey = getStorageKey(userEmail);
    const existingColors = await getSavedColors(userEmail);
    const updatedColors = existingColors.map(c =>
        c.hex.toUpperCase() === colorHex.toUpperCase() ? { ...c, note: note } : c
    );
    window.localStorage.setItem(storageKey, JSON.stringify(updatedColors));
}
