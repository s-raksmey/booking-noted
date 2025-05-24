'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/db';
import { bookings as bookingsTable, rooms as roomsTable, users as usersTable } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { toast } from 'sonner';

interface Booking {
  id: string;
  roomName: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({ date: '', room: '', user: '' });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      // Build conditions array
      const conditions = [];

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

      // Add user condition if filter exists
      if (filters.user) {
        conditions.push(eq(usersTable.name, filters.user));
      }

      // Execute query with all conditions
      const data = await db
        .select({
          id: bookingsTable.id,
          roomName: roomsTable.name,
          userName: usersTable.name,
          startTime: bookingsTable.startTime,
          endTime: bookingsTable.endTime,
          status: bookingsTable.status,
        })
        .from(bookingsTable)
        .innerJoin(roomsTable, eq(bookingsTable.roomId, roomsTable.id))
        .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      setBookings(data);
    } catch (error) {
      toast.error('Failed to fetch booking history');
      console.error('Error fetching bookings:', error);
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
          <div>
            <Label>User</Label>
            <Input
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Room</th>
                <th>User</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.roomName}</td>
                  <td>{booking.userName}</td>
                  <td>{new Date(booking.startTime).toLocaleString()}</td>
                  <td>{new Date(booking.endTime).toLocaleString()}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}