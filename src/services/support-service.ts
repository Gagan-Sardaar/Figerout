import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, Timestamp, orderBy } from "firebase/firestore";

export interface SupportTicket {
    id: string;
    userId: string;
    userEmail: string;
    reason: string;
    status: 'open' | 'approved' | 'rejected';
    createdAt: Date;
    type: 'account_deletion';
}

const supportCollectionRef = collection(db, 'supportTickets');

export async function createDeletionRequest(userId: string, userEmail: string, reason: string): Promise<void> {
    await addDoc(supportCollectionRef, {
        userId,
        userEmail,
        reason,
        status: 'open',
        createdAt: serverTimestamp(),
        type: 'account_deletion',
    });
}

export async function getDeletionRequests(): Promise<SupportTicket[]> {
    const q = query(supportCollectionRef, where("type", "==", "account_deletion"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        return {
            id: doc.id,
            ...data,
            createdAt: createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date(),
        } as SupportTicket;
    });
}

export async function updateRequestStatus(ticketId: string, status: 'approved' | 'rejected'): Promise<void> {
    const ticketRef = doc(db, 'supportTickets', ticketId);
    await updateDoc(ticketRef, { status });
}
