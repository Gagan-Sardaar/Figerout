
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, Timestamp, orderBy, getDoc, limit, deleteField } from "firebase/firestore";
import { addLogEntry } from './logging-service';
import { updateUser } from './user-service';
import { addNotification } from './notification-service';

export interface SupportTicket {
    id: string;
    userId: string;
    userEmail: string;
    reason: string;
    status: 'open' | 'approved' | 'rejected' | 'cancelled';
    createdAt: Date;
    type: 'account_deletion';
}

const supportCollectionRef = collection(db, 'supportTickets');

export async function createDeletionRequest(userId: string, userEmail: string, reason: string): Promise<void> {
    const q = query(supportCollectionRef, where("userId", "==", userId), where("status", "in", ["open", "approved"]));
    const existingRequests = await getDocs(q);

    if (!existingRequests.empty) {
        throw new Error("An account deletion request is already in progress.");
    }

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
    const q = query(supportCollectionRef, where("type", "==", "account_deletion"));
    const querySnapshot = await getDocs(q);
    const tickets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        return {
            id: doc.id,
            ...data,
            createdAt: createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date(),
        } as SupportTicket;
    });

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
        `Support ticket ${ticketId} for user ${ticketData.userEmail} was ${status}.`,
        { ticketId, status, userId }
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
                type: 'warning',
                title: 'Account Deletion Approved',
                message: 'Your account deletion has been approved and your account is now disabled. It will be permanently deleted in 30 days.'
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

export async function cancelDeletionRequest(userId: string): Promise<void> {
    if (!userId) throw new Error("User ID is required.");
    
    const q = query(supportCollectionRef, where("userId", "==", userId), where("status", "in", ["open", "approved"]), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("No active deletion request found to cancel.");
    }

    const ticketDoc = querySnapshot.docs[0];
    const originalStatus = ticketDoc.data().status;
    const ticketId = ticketDoc.id;

    await updateDoc(ticketDoc.ref, { status: 'cancelled' });

    if (originalStatus === 'approved') {
        await updateUser(userId, {
            status: 'active',
            deletionScheduledAt: deleteField()
        });
    }
    
    await addLogEntry(
        'deletion_request_cancelled',
        `User ${ticketDoc.data().userEmail} cancelled their account deletion request.`,
        { userId, ticketId, originalStatus }
    );

    await addNotification(userId, {
        type: 'info',
        title: 'Deletion Request Cancelled',
        message: 'Your account deletion request has been successfully cancelled. Your account will not be deleted.'
    });
}

export async function getOpenDeletionRequestForUser(userId: string): Promise<SupportTicket | null> {
    if (!userId) return null;
    try {
        // Query without the orderBy clause to avoid needing a composite index.
        const q = query(
            supportCollectionRef,
            where("userId", "==", userId),
            where("status", "in", ["open", "approved"])
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const tickets = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            return {
                id: doc.id,
                ...data,
                createdAt: createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date(),
            } as SupportTicket;
        });

        // Sort client-side to get the most recent request
        tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return tickets.length > 0 ? tickets[0] : null;

    } catch (error) {
        console.error("Error fetching open deletion request for user:", error);
        // The original function returned null on error, so we maintain that behavior.
        return null;
    }
}
