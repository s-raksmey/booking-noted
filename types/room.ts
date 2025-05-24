// types/room.ts
export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  location: string;
  features: string; // JSON string
  autoApprove: boolean;
  restrictedHours?: string;
  suspendedUntil?: number; // UNIX timestamp
}