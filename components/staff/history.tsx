'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Loader2, Building2 } from 'lucide-react';

interface Booking {
  id: string;
  roomName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    roomName: 'Conference Room A',
    startTime: '2025-05-25T09:00:00Z',
    endTime: '2025-05-25T11:00:00Z',
    status: 'APPROVED',
  },
  {
    id: 'booking-002',
    roomName: 'Meeting Room B',
    startTime: '2025-05-24T14:00:00Z',
    endTime: '2025-05-24T15:30:00Z',
    status: 'PENDING',
  },
  {
    id: 'booking-003',
    roomName: 'Boardroom',
    startTime: '2025-05-23T10:00:00Z',
    endTime: '2025-05-23T12:00:00Z',
    status: 'REJECTED',
  },
  {
    id: 'booking-004',
    roomName: 'Training Room',
    startTime: '2025-05-26T13:00:00Z',
    endTime: '2025-05-26T16:00:00Z',
    status: 'APPROVED',
  },
];

export function History() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({ date: '', room: '' });
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      // Simulate fetching bookings with mock data
      setTimeout(() => {
        let filteredBookings = mockBookings;
        if (filters.date) {
          const parsedDate = new Date(filters.date);
          const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
          filteredBookings = filteredBookings.filter(
            (booking) =>
              new Date(booking.startTime) >= startOfDay &&
              new Date(booking.endTime) <= endOfDay
          );
        }
        if (filters.room) {
          filteredBookings = filteredBookings.filter((booking) =>
            booking.roomName.toLowerCase().includes(filters.room.toLowerCase())
          );
        }
        setBookings(filteredBookings);
        setLoading(false);
      }, 1000); // Simulate network delay
    }
  }, [filters, session]);

  const handleCancel = async (id: string) => {
    try {
      // Simulate cancellation
      console.log('Mock cancellation:', { id });
      setTimeout(() => {
        setBookings((prev) => prev.filter((booking) => booking.id !== id));
        toast.success('Booking cancelled');
      }, 500); // Simulate network delay
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ date: '', room: '' });
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-800 dark:text-gray-200">
        Please sign in to view booking history.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Booking History</h1>
      <Card className="mb-6 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-lg text-blue-600 dark:text-blue-400">Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label className="text-gray-800 dark:text-gray-200">Date</Label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="border-blue-200 dark:border-blue-700"
              />
            </div>
            <div className="flex-1">
              <Label className="text-gray-800 dark:text-gray-200">Room</Label>
              <Input
                value={filters.room}
                onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                placeholder="Enter room name"
                className="border-blue-200 dark:border-blue-700"
              />
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
          <CardContent className="py-8">
            <p className="text-gray-600 dark:text-gray-400">No bookings found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Building2 className="h-5 w-5" />
                        {booking.roomName}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          booking.status === 'APPROVED'
                            ? 'border-green-200 dark:border-green-700 text-green-600 dark:text-green-400'
                            : booking.status === 'PENDING'
                            ? 'border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400'
                            : 'border-red-200 dark:border-red-700 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      Start: {new Date(booking.startTime).toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4" />
                      End: {new Date(booking.endTime).toLocaleString()}
                    </p>
                    {booking.status !== 'REJECTED' && (
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(booking.id)}
                        className="mt-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}