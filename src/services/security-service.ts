
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp, Timestamp, orderBy, limit, getDoc, onSnapshot } from "firebase/firestore";
import { addLogEntry } from './logging-service';

export interface FailedLoginAttempt {
  id?: string;
  email: string;
  timestamp: Date;
  ipAddress: string; // Placeholder
  location: string; // Placeholder
  lockoutPeriod?: string;
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

export async function processFailedLogin(email: string): Promise<LockoutState> {
    const lowercasedEmail = email.toLowerCase();
    const lockoutDocRef = doc(lockoutsCollectionRef, lowercasedEmail);
    const currentLockoutState = await getLockoutState(lowercasedEmail);

    const attempts = (currentLockoutState?.attempts || 0) + 1;
    const now = new Date();

    let newLockoutUntil: Date | null = null;
    let lockoutMessage = "";
    let lockoutPeriodLog: string | undefined = undefined;

    if (attempts >= 9) {
        newLockoutUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        lockoutMessage = "Account locked for 30 days.";
        lockoutPeriodLog = "30 days";
    } else if (attempts >= 6) {
        newLockoutUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        lockoutMessage = "Account locked for 24 hours.";
        lockoutPeriodLog = "24 hours";
    } else if (attempts >= 3) {
        newLockoutUntil = new Date(now.getTime() + 15 * 60 * 1000);
        lockoutMessage = "Login locked for 15 minutes.";
        lockoutPeriodLog = "15 minutes";
    }

    // This log entry is for the security dashboard table
    await addDoc(failedLoginsCollectionRef, {
        email: lowercasedEmail,
        timestamp: serverTimestamp(),
        ipAddress: "127.0.0.1 (simulated)",
        location: "Local (simulated)",
        lockoutPeriod: lockoutPeriodLog, // This is the field in question
    });
    
    // This state is for enforcing the lockout
    const newLockoutStateData: LockoutState = {
        email: lowercasedEmail,
        attempts: attempts,
        until: newLockoutUntil ? Timestamp.fromDate(newLockoutUntil) : null,
    };
    await setDoc(lockoutDocRef, newLockoutStateData);
    
    // This is for the general-purpose activity log
    await addLogEntry('failed_login_attempt', `Failed login for ${email}. Attempt #${attempts}. ${lockoutMessage}`, { email, attempts });
    
    return newLockoutStateData;
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
    // On successful login, always remove the lockout state.
    await deleteDoc(docRef).catch((e) => {
        if (e.code !== 'not-found') { // It's ok if the doc doesn't exist.
            console.error("Error clearing successful login state:", e);
        }
    });
}

export function onFailedLoginsChange(
  callback: (attempts: FailedLoginAttempt[]) => void,
  entryLimit = 50
): () => void {
  const q = query(failedLoginsCollectionRef, orderBy('timestamp', 'desc'), limit(entryLimit));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const attempts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      return {
        id: doc.id,
        email: data.email,
        timestamp: timestamp?.toDate ? timestamp.toDate() : new Date(),
        ipAddress: data.ipAddress,
        location: data.location,
        lockoutPeriod: data.lockoutPeriod,
      } as FailedLoginAttempt;
    });
    callback(attempts);
  }, (error) => {
    console.error("Error listening to failed login attempts:", error);
  });

  return unsubscribe;
}
