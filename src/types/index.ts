export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'drawn';
  ticketPriceRupees: number; // 49
  prizeDescription: string;
  grandPrize: string;
  secondPrize?: string;
  thirdPrize?: string;
  totalTicketsSold: number;
  drawDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OrderPaymentStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CASH';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  campaignId: string;
  quantity: number;
  ticketPriceRupees: number; // 49
  totalAmountRupees: number;
  status: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  utrNumber: string;
  notes?: string;
  paymentGateway?: 'RUPAYEX' | 'MANUAL';
  gatewayData?: Record<string, unknown>;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  campaignId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'WINNER';
  createdAt: string;
}

export interface Draw {
  id: string;
  campaignId: string;
  winningTicketId: string;
  winningTicketNumber: string;
  winnerUserId: string;
  winnerName: string;
  winnerEmail: string;
  prizeDescription: string;
  totalEligibleTickets: number;
  drawDate: string;
  drawnBy: string;
}
