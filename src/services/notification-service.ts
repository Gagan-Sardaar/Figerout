
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { addLogEntry } from './logging-service';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  createdAt: Date;
}

const notificationsCollectionRef = (userId: string) => collection(db, `users/${userId}/notifications`);

export async function addNotification(
  userId: string,
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'userId' | 'read'>
): Promise<void> {
  try {
    await addDoc(notificationsCollectionRef(userId), {
      ...notification,
      userId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error adding notification for user ${userId}:`, error);
    await addLogEntry('notification_failed', `Failed to send notification to user ${userId}`, {
      userId,
      error: (error as Error).message,
    });
  }
}

export function onNotificationsChange(
  userId: string,
  callback: (notifications: AppNotification[]) => void,
  notificationLimit = 10
): () => void {
  const q = query(
    notificationsCollectionRef(userId),
    orderBy('createdAt', 'desc'),
    limit(notificationLimit)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAtTimestamp = data.createdAt as Timestamp;
      return {
        id: doc.id,
        ...data,
        createdAt: createdAtTimestamp?.toDate() ?? new Date(),
      } as AppNotification;
    });
    callback(notifications);
  }, (error) => {
    console.error(`Error listening to notifications for user ${userId}:`, error);
  });

  return unsubscribe;
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const docRef = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(docRef, { read: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    const notificationsRef = notificationsCollectionRef(userId);
    const unreadQuery = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(unreadQuery);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
}
