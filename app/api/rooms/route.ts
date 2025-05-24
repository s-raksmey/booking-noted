import { NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms as roomsTable } from '@/db/schema';
import { isNull, lte, or } from 'drizzle-orm';

export async function GET() {
  try {
    const rooms = await db
      .select({
        id: roomsTable.id,
        name: roomsTable.name,
        capacity: roomsTable.capacity,
        location: roomsTable.location,
        features: roomsTable.features,
        autoApprove: roomsTable.autoApprove,
        suspendedUntil: roomsTable.suspendedUntil,
      })
      .from(roomsTable)
      .where(
        or(
          isNull(roomsTable.suspendedUntil),
          lte(roomsTable.suspendedUntil, new Date())
        )
      );

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
