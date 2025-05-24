'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Users, CheckCircle, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  features: string[];
  autoApprove: boolean;
  suspendedUntil: string | null;
}

const mockRooms: Room[] = [
  {
    id: 'room-001',
    name: 'Conference Room A',
    capacity: 20,
    location: 'Building 1, Floor 3',
    features: ['Projector', 'Whiteboard', 'Video Conferencing'],
    autoApprove: true,
    suspendedUntil: null,
  },
  {
    id: 'room-002',
    name: 'Meeting Room B',
    capacity: 10,
    location: 'Building 2, Floor 1',
    features: ['Whiteboard', 'Coffee Machine'],
    autoApprove: false,
    suspendedUntil: null,
  },
  {
    id: 'room-003',
    name: 'Boardroom',
    capacity: 30,
    location: 'Building 1, Floor 5',
    features: ['Projector', 'Video Conferencing', 'Catering Area'],
    autoApprove: true,
    suspendedUntil: '2025-05-20T00:00:00Z',
  },
  {
    id: 'room-004',
    name: 'Training Room',
    capacity: 15,
    location: 'Building 3, Floor 2',
    features: ['Computers', 'Projector'],
    autoApprove: false,
    suspendedUntil: null,
  },
  {
    id: 'room-005',
    name: 'Collaboration Hub',
    capacity: 8,
    location: 'Building 2, Floor 4',
    features: ['Smart TV', 'Whiteboard'],
    autoApprove: true,
    suspendedUntil: null,
  },
];

export function RoomBooking() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Simulate fetching rooms with mock data
    setLoading(true);
    const filteredRooms = mockRooms.filter(
      (room) => !room.suspendedUntil || new Date(room.suspendedUntil) <= new Date()
    );
    setTimeout(() => {
      setRooms(filteredRooms);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !date || !startTime || !endTime || !selectedRoom) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
      const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);

      // Simulate booking creation
      console.log('Mock booking:', {
        roomId: selectedRoom.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        equipment,
        status: selectedRoom.autoApprove ? 'APPROVED' : 'PENDING',
      });

      // Simulate success response
      setTimeout(() => {
        toast.success(
          `Booking ${selectedRoom.autoApprove ? 'created' : 'requested'} successfully`
        );
        // Reset form and close modal
        setSelectedRoom(null);
        setDate(new Date());
        setStartTime('');
        setEndTime('');
        setEquipment([]);
        setModalOpen(false);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      toast.error('Failed to book room');
      console.error('Error booking room:', error);
      setLoading(false);
    }
  };

  const openBookingModal = (room: Room) => {
    setSelectedRoom(room);
    setModalOpen(true);
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
        Please sign in to book rooms.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Book a Room</h1>
      {loading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-72 animate-pulse bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-blue-500/50">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-blue-500/20 dark:bg-blue-700/20 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-blue-500/20 dark:bg-blue-700/20 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-blue-500/20 dark:bg-blue-700/20 rounded w-1/3 mx-auto"></div>
                <div className="flex justify-center gap-2">
                  <div className="h-4 bg-blue-500/20 dark:bg-blue-700/20 rounded w-16"></div>
                  <div className="h-4 bg-blue-500/20 dark:bg-blue-700/20 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="text-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-blue-500/50">
          <CardContent className="py-8">
            <p className="text-gray-600 dark:text-gray-400">No rooms available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="h-72 w-full bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-blue-500/50 cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => openBookingModal(room)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full space-y-4 text-center">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {room.location}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity: {room.capacity}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {room.features.slice(0, 3).map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {room.features.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                        >
                          +{room.features.length - 3}
                        </Badge>
                      )}
                    </div>
                    {room.autoApprove && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Auto-Approved
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-md">
            <DialogHeader>
              <DialogTitle className="text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Book {selectedRoom?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookRoom} className="space-y-4">
              <div>
                <Label className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border border-blue-200 dark:border-blue-700"
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={loading}
                  className="border-blue-200 dark:border-blue-700"
                />
              </div>
              <div>
                <Label className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={loading}
                  className="border-blue-200 dark:border-blue-700"
                />
              </div>
              <div>
                <Label className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equipment (comma-separated)
                </Label>
                <Input
                  value={equipment.join(', ')}
                  onChange={(e) => setEquipment(e.target.value.split(',').map((f) => f.trim()))}
                  disabled={loading}
                  className="border-blue-200 dark:border-blue-700"
                  placeholder="e.g., Laptop, Projector"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={loading}
                  className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    'Book Room'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </motion.div>
      </Dialog>
    </div>
  );
}
