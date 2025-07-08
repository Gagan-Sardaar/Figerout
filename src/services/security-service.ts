
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp, Timestamp, orderBy, limit, getDoc, onSnapshot } from "firebase/firestore";
import { addLogEntry } from './logging-service';

export interface FailedLoginAttempt {
  id?: string;
  email: string;
  timestamp: Timestamp;
  ipAddress: string; // Placeholder
  location: string; // Placeholder
}

export interface LockoutState {
    email: string;
    attempts: number;
    until: Timestamp | null;
}

const failedLoginsCollectionRef = collection(db, 'failedLoginAttempts');
const lockoutsCollectionRef = collection(db, 'loginLockouts');

export async function getLockoutState(email: string): Promise<LockoutState | null> {
    const docRef = doc(lockoutsCollectionRef, email.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data as LockoutState;
    }
    return null;
}

// This function simulates what a backend would do.
export async function processFailedLogin(email: string): Promise<LockoutState> {
    const lowercasedEmail = email.toLowerCase();
    const docRef = doc(lockoutsCollectionRef, lowercasedEmail);

    // Log the attempt first
    await addDoc(failedLoginsCollectionRef, {
        email: lowercasedEmail,
        timestamp: serverTimestamp(),
        ipAddress: "127.0.0.1 (simulated)",
        location: "Local (simulated)",
    });

    const currentState = await getLockoutState(lowercasedEmail);
    const now = new Date();
    
    let attempts = (currentState?.attempts || 0) + 1;
    let lockoutUntil: Date | null = null;
    let lockoutMessage = "";

    if (attempts >= 9) {
        lockoutUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        lockoutMessage = `Account locked for 30 days.`;
    } else if (attempts >= 6) {
        lockoutUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        lockoutMessage = `Account locked for 24 hours.`;
    } else if (attempts >= 3) {
        lockoutUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        lockoutMessage = `Login locked for 15 minutes.`;
    }

    const newState: LockoutState = {
        email: lowercasedEmail,
        attempts: attempts,
        until: lockoutUntil ? Timestamp.fromDate(lockoutUntil) : null,
    };

    await setDoc(docRef, newState);
    
    await addLogEntry('failed_login_attempt', `Failed login for ${email}. Attempt #${attempts}. ${lockoutMessage}`, { email, attempts });
    
    return newState;
}

export async function resetLockout(email: string): Promise<void> {
    const lowercasedEmail = email.toLowerCase();
    const docRef = doc(lockoutsCollectionRef, lowercasedEmail);
    await deleteDoc(docRef);
    await addLogEntry('lockout_reset', `Admin reset login lockout for ${email}.`, { email });
}

export async function clearSuccessfulLogin(email: string): Promise<void> {
    const lowercasedEmail = email.toLowerCase();
    const docRef = doc(lockoutsCollectionRef, lowercasedEmail);
    const currentState = await getLockoutState(lowercasedEmail);
    // Only clear if not under a long-term lockout
    if (currentState && currentState.attempts < 6) {
       await deleteDoc(docRef);
    }
}

export function onFailedLoginsChange(
  callback: (attempts: FailedLoginAttempt[]) => void,
  entryLimit = 50
): () => void {
  const q = query(failedLoginsCollectionRef, orderBy('timestamp', 'desc'), limit(entryLimit));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const attempts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, ...data } as FailedLoginAttempt;
    });
    callback(attempts);
  }, (error) => {
    console.error("Error listening to failed login attempts:", error);
  });

  return unsubscribe;
}
