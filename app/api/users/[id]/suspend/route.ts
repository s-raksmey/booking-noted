import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toUserResponse } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, params.id));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { isSuspended } = await request.json();

    const [updatedUser] = await db.update(users)
      .set({
        isSuspended,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.id))
      .returning();

    return NextResponse.json(toUserResponse(updatedUser));
  } catch (error) {
    console.error('Suspend user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}