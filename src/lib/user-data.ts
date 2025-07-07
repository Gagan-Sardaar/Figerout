
export interface User {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastLogin?: { days: number; hours?: number; minutes?: number }; // This will be deprecated
  status: 'active' | 'inactive' | 'invited';
}

// This type was used for client-side date formatting of mock data.
// It can be adapted or removed as we integrate real-time auth data.
export interface DisplayUser extends Omit<User, 'lastLogin'> {
    lastLogin: string;
}

// The static user array is now removed. User data will be fetched from Firestore.
export const users: User[] = [];
