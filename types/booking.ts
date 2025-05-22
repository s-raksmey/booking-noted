// types/booking.ts
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  roomName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}