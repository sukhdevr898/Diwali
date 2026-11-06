import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Campaign, Order, Ticket, Draw, UserProfile } from '../types';

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'sukhdevr898@gmail.com';
export const CAMPAIGN_ID = 'diwali-bumper-2026';
export const TICKET_RATE_RUPEES = 49;

export async function syncUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    // If admin, also write to /admins/{uid}
    if (isAdmin) {
      const adminRef = doc(db, 'admins', user.uid);
      await setDoc(adminRef, { email: user.email, addedAt: new Date().toISOString() }, { merge: true });
    }

    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Player',
        role: isAdmin ? 'admin' : 'user',
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const existing = snap.data() as UserProfile;
      // Guarantee admin role if email matches
      if (isAdmin && existing.role !== 'admin') {
        await updateDoc(userRef, { role: 'admin' });
        existing.role = 'admin';
      }
      return existing;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export function subscribeCampaign(callback: (campaign: Campaign) => void): Unsubscribe {
  const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);

  return onSnapshot(
    campaignRef,
    async snap => {
      if (snap.exists()) {
        callback({ id: snap.id, ...(snap.data() as Omit<Campaign, 'id'>) });
      } else {
        // Initialize default active campaign at 49 INR
        const initialCampaign: Omit<Campaign, 'id'> = {
          title: 'Diwali Mahabumper Bumper Lottery 2026',
          status: 'active',
          ticketPriceRupees: TICKET_RATE_RUPEES,
          prizeDescription: '₹2,50,000 Grand Diwali Gold & Cash Bumper',
          grandPrize: '₹2,50,000 Cash + 10g 24K Gold Coin',
          secondPrize: '₹50,000 Cash (3 Lucky Winners)',
          thirdPrize: '₹10,000 Cash (10 Lucky Winners)',
          totalTicketsSold: 0,
          drawDate: '2026-11-12T18:00:00.000Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          // If admin is signed in, initialize campaign
          if (auth.currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            await setDoc(campaignRef, initialCampaign);
          }
        } catch {
          // Ignore if permission denied during first non-admin visit
        }
        callback({ id: CAMPAIGN_ID, ...initialCampaign });
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, `campaigns/${CAMPAIGN_ID}`);
    }
  );
}

export async function createTicketOrder(params: {
  userId: string;
  userEmail: string;
  userName: string;
  quantity: number;
  paymentMethod: 'UPI' | 'BANK_TRANSFER' | 'CASH';
  utrNumber: string;
  notes?: string;
  orderId?: string;
  paymentGateway?: 'RUPAYEX' | 'MANUAL';
  gatewayData?: Record<string, unknown>;
}): Promise<string> {
  const orderId = params.orderId || `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const totalAmountRupees = params.quantity * TICKET_RATE_RUPEES;

  const orderData: Order = {
    id: orderId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    campaignId: CAMPAIGN_ID,
    quantity: params.quantity,
    ticketPriceRupees: TICKET_RATE_RUPEES,
    totalAmountRupees,
    status: 'PENDING_VERIFICATION',
    paymentMethod: params.paymentMethod,
    utrNumber: params.utrNumber.trim(),
    notes: params.notes?.trim() || '',
    paymentGateway: params.paymentGateway || 'MANUAL',
    gatewayData: params.gatewayData || {},
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'orders', orderId), orderData);
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
  }
}

export function subscribeUserOrders(
  userId: string,
  callback: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      callback(orders);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export function subscribeAllOrders(callback: (orders: Order[]) => void): Unsubscribe {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
      callback(orders);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export async function verifyOrderPayment(
  order: Order,
  approve: boolean,
  rejectionReason?: string
): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  const orderRef = doc(db, 'orders', order.id);

  if (approve) {
    batch.update(orderRef, {
      status: 'APPROVED',
      utrNumber: order.utrNumber,
      verifiedAt: now,
      verifiedBy: auth.currentUser?.email || 'admin',
    });

    // Generate lottery tickets with serialized numbers
    for (let i = 0; i < order.quantity; i++) {
      const ticketId = `TKT_${order.id}_${i + 1}_${Math.random().toString(36).substring(2, 6)}`;
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const ticketNumber = `DL-2026-${randomSuffix}`;

      const ticketRef = doc(db, 'tickets', ticketId);
      const ticketData: Ticket = {
        id: ticketId,
        ticketNumber,
        orderId: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        userName: order.userName,
        campaignId: order.campaignId,
        status: 'ACTIVE',
        createdAt: now,
      };
      batch.set(ticketRef, ticketData);
    }

    // Increment campaign tickets sold
    const campaignRef = doc(db, 'campaigns', order.campaignId);
    batch.update(campaignRef, {
      totalTicketsSold: increment(order.quantity),
      updatedAt: now,
    });
  } else {
    batch.update(orderRef, {
      status: 'REJECTED',
      rejectionReason: rejectionReason || 'Payment verification failed (UTR/receipt not matching)',
      verifiedAt: now,
      verifiedBy: auth.currentUser?.email || 'admin',
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
}

export function subscribeUserTickets(
  userId: string,
  callback: (tickets: Ticket[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Ticket, 'id'>) }));
      callback(tickets);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'tickets');
    }
  );
}

export function subscribeAllTickets(callback: (tickets: Ticket[]) => void): Unsubscribe {
  const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Ticket, 'id'>) }));
      callback(tickets);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'tickets');
    }
  );
}

export async function executeLotteryDraw(
  campaign: Campaign,
  eligibleTickets: Ticket[],
  chosenTicketId?: string,
  customPrize?: string
): Promise<Draw> {
  if (eligibleTickets.length === 0) {
    throw new Error('No confirmed tickets available to draw a winner!');
  }

  let winningTicket: Ticket;
  if (chosenTicketId) {
    const found = eligibleTickets.find(t => t.id === chosenTicketId);
    if (!found) {
      throw new Error('Selected ticket not found among active tickets!');
    }
    winningTicket = found;
  } else {
    const winnerIndex = Math.floor(Math.random() * eligibleTickets.length);
    winningTicket = eligibleTickets[winnerIndex];
  }

  const drawId = `DRAW_${Date.now()}`;
  const now = new Date().toISOString();

  const drawData: Draw = {
    id: drawId,
    campaignId: campaign.id,
    winningTicketId: winningTicket.id,
    winningTicketNumber: winningTicket.ticketNumber,
    winnerUserId: winningTicket.userId,
    winnerName: winningTicket.userName,
    winnerEmail: winningTicket.userEmail,
    prizeDescription: customPrize || campaign.grandPrize,
    totalEligibleTickets: eligibleTickets.length,
    drawDate: now,
    drawnBy: auth.currentUser?.email || 'admin',
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'draws', drawId), drawData);
  batch.update(doc(db, 'tickets', winningTicket.id), { status: 'WINNER' });
  batch.update(doc(db, 'campaigns', campaign.id), {
    status: 'drawn',
    updatedAt: now,
  });

  try {
    await batch.commit();
    return drawData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `draws/${drawId}`);
  }
}

export function subscribeDraws(callback: (draws: Draw[]) => void): Unsubscribe {
  const q = query(collection(db, 'draws'), orderBy('drawDate', 'desc'));

  return onSnapshot(
    q,
    snap => {
      const draws = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Draw, 'id'>) }));
      callback(draws);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'draws');
    }
  );
}
