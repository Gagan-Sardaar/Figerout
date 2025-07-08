import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, Timestamp, orderBy, getDoc } from "firebase/firestore";
import { addLogEntry } from './logging-service';
import { updateUser } from './user-service';
import { addNotification } from './notification-service';

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

    await addLogEntry(
        'support_request_created',
        `User ${userEmail} requested account deletion.`,
        { userId, userEmail, reason }
    );
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
    const ticketDoc = await getDoc(ticketRef);
    if (!ticketDoc.exists()) {
        throw new Error("Ticket not found");
    }
    const ticketData = ticketDoc.data();
    const userId = ticketData.userId;

    await updateDoc(ticketRef, { status });

    await addLogEntry(
        'support_request_updated',
        `Support ticket ${ticketId} was ${status}.`,
        { ticketId, status }
    );

    if (status === 'approved') {
        if (userId) {
            await updateUser(userId, { 
                status: 'pending_deletion', 
                deletionScheduledAt: serverTimestamp()
            });
            await addLogEntry(
                'user_marked_for_deletion',
                `User account ${userId} marked for deletion following support request approval.`,
                { userId, ticketId }
            );
            await addNotification(userId, {
                type: 'success',
                title: 'Deletion Request Approved',
                message: 'Your account deletion request has been approved. Your account and data will be permanently deleted in 30 days.'
            });
        }
    } else if (status === 'rejected') {
         if (userId) {
            await addNotification(userId, {
                type: 'error',
                title: 'Deletion Request Rejected',
                message: 'Your recent account deletion request was rejected. Please contact support if you have questions.'
            });
         }
    }
}
