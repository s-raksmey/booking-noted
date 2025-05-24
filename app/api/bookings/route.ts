import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings as bookingsTable, rooms as roomsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-option';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, startTime, endTime, equipment } = await request.json();
    if (!roomId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch room to determine autoApprove status
    const [room] = await db
      .select({ autoApprove: roomsTable.autoApprove })
      .from(roomsTable)
      .where(eq(roomsTable.id, roomId));

    if (!room) {
      return NextResponse.json({ error: 'Invalid room selected' }, { status: 400 });
    }

    const [newBooking] = await db
      .insert(bookingsTable)
      .values({
        id: crypto.randomUUID(),
        roomId,
        userId: session.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        equipment: JSON.stringify(equipment || []),
        status: room.autoApprove ? 'APPROVED' : 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      message: `Booking ${room.autoApprove ? 'created' : 'requested'} successfully`,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
