import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface LogEntry {
  id?: string;
  timestamp: Date;
  type: string;
  message: string;
  details: Record<string, any>;
}

const logsCollectionRef = collection(db, 'logs');

export async function addLogEntry(
  type: string,
  message: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await addDoc(logsCollectionRef, {
      timestamp: serverTimestamp(),
      type,
      message,
      details,
    });
  } catch (error) {
    console.error('Error adding log entry:', error);
    // In a production app, you might want to send this to a dedicated logging service
  }
}

export async function getLogEntries(entryLimit = 50): Promise<LogEntry[]> {
  try {
    const q = query(
      logsCollectionRef,
      orderBy('timestamp', 'desc'),
      limit(entryLimit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      return {
        id: doc.id,
        timestamp: timestamp?.toDate ? timestamp.toDate() : new Date(),
        type: data.type,
        message: data.message,
        details: data.details,
      };
    });
  } catch (error) {
    console.error('Error fetching log entries:', error);
    return [];
  }
}
