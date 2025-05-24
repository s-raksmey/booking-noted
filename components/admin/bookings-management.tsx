'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/db';
import { bookings as bookingsTable, rooms as roomsTable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({ date: '', room: '' });
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      fetchBookings();
    }
  }, [filters, session]);

  const fetchBookings = async () => {
    try {
      // Build conditions array
      const conditions = [eq(bookingsTable.userId, session!.user.id)];

      // Add date condition if filter exists
      if (filters.date) {
        const date = new Date(filters.date);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        conditions.push(
          gte(bookingsTable.startTime, startOfDay),
          lte(bookingsTable.endTime, endOfDay)
        );
      }

      // Add room condition if filter exists
      if (filters.room) {
        conditions.push(eq(roomsTable.name, filters.room));
      }

      // Execute query with all conditions
      const data = await db
        .select({
          id: bookingsTable.id,
          roomName: roomsTable.name,
          startTime: bookingsTable.startTime,
          endTime: bookingsTable.endTime,
          status: bookingsTable.status,
        })
        .from(bookingsTable)
        .innerJoin(roomsTable, eq(bookingsTable.roomId, roomsTable.id))
        .where(and(...conditions));

      setBookings(data as Booking[]);
    } catch (error) {
      toast.error('Failed to fetch booking history');
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await db.delete(bookingsTable).where(eq(bookingsTable.id, id));
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div>
            <Label>Room</Label>
            <Input
              value={filters.room}
              onChange={(e) => setFilters({ ...filters, room: e.target.value })}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Room</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.roomName}</td>
                  <td>{new Date(booking.startTime).toLocaleString()}</td>
                  <td>{new Date(booking.endTime).toLocaleString()}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status !== 'REJECTED' && (
                      <Button variant="outline" onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}