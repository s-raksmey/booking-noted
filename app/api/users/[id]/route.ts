import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toUserResponse } from '@/lib/auth';
import { UpdateUserInput, UserResponse } from '@/types/user';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, params.id));
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toUserResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, role, isSuspended } = (await request.json()) as UpdateUserInput;

    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, params.id));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed to an existing one
    if (email && email !== existingUser.email) {
      const [userWithEmail] = await db.select().from(users).where(eq(users.email, email));
      if (userWithEmail) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update user
    const [updatedUser] = await db.update(users)
      .set({
        name: name ?? existingUser.name,
        email: email ?? existingUser.email,
        role: role ?? existingUser.role,
        isSuspended: isSuspended ?? existingUser.isSuspended,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.id))
      .returning();

    return NextResponse.json(toUserResponse(updatedUser));
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, params.id));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await db.delete(users).where(eq(users.id, params.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}