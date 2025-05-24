'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  features: string[];
  autoApprove: boolean;
  restrictedHours?: string;
  suspendedUntil?: Date;
}

export function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 0, location: '', features: '', autoApprove: false });
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await db.select().from(rooms);
      setRooms(data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.insert(rooms).values({
        ...newRoom,
        features: newRoom.features.split(',').map(f => f.trim()),
      });
      toast.success('Room added successfully');
      setNewRoom({ name: '', capacity: 0, location: '', features: '', autoApprove: false });
      fetchRooms();
    } catch (error) {
      toast.error('Failed to add room');
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      await db.update(rooms).set({
        ...editingRoom,
        features: editingRoom.features,
      }).where(eq(rooms.id, editingRoom.id));
      toast.success('Room updated successfully');
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await db.delete(rooms).where(eq(rooms.id, id));
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleSuspendRoom = async (id: string, days: number) => {
    try {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + days);
      await db.update(rooms).set({ suspendedUntil }).where(eq(rooms.id, id));
      toast.success(`Room suspended for ${days} days`);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to suspend room');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom} className="mb-6 space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={editingRoom ? editingRoom.name : newRoom.name}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, name: e.target.value }) : setNewRoom({ ...newRoom, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Capacity</Label>
            <Input
              type="number"
              value={editingRoom ? editingRoom.capacity : newRoom.capacity}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) }) : setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={editingRoom ? editingRoom.location : newRoom.location}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, location: e.target.value }) : setNewRoom({ ...newRoom, location: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Features (comma-separated)</Label>
            <Input
              value={editingRoom ? editingRoom.features.join(', ') : newRoom.features}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, features: e.target.value.split(',').map(f => f.trim()) }) : setNewRoom({ ...newRoom, features: e.target.value })}
            />
          </div>
          <div>
            <Label>Auto-Approve</Label>
            <Select
              value={editingRoom ? editingRoom.autoApprove.toString() : newRoom.autoApprove.toString()}
              onValueChange={(value) => editingRoom ? setEditingRoom({ ...editingRoom, autoApprove: value === 'true' }) : setNewRoom({ ...newRoom, autoApprove: value === 'true' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{editingRoom ? 'Update Room' : 'Add Room'}</Button>
          {editingRoom && <Button variant="outline" onClick={() => setEditingRoom(null)}>Cancel</Button>}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Features</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  <td>{room.capacity}</td>
                  <td>{room.location}</td>
                  <td>{room.features.join(', ')}</td>
                  <td>{room.suspendedUntil && new Date(room.suspendedUntil) > new Date() ? 'Suspended' : 'Available'}</td>
                  <td>
                    <Button variant="outline" onClick={() => setEditingRoom(room)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteRoom(room.id)}>Delete</Button>
                    <Button variant="outline" onClick={() => handleSuspendRoom(room.id, 7)}>Suspend 1 Week</Button>
                    <Button variant="outline" onClick={() => handleSuspendRoom(room.id, 21)}>Suspend 3 Weeks</Button>
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