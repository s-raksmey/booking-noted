import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { toUserResponse } from '@/lib/auth';
import { UpdateUserInput } from '@/types/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-option';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // First get the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || 
        (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Await params to get the id
    const { id: userId } = await params;

    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { name, email, role, isSuspended } = (await request.json()) as UpdateUserInput;

    // Only super-admins can change roles
    if (role && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super-admins can change user roles' },
        { status: 403 }
      );
    }

    if (email && email !== existingUser.email) {
      const [userWithEmail] = await db.select().from(users).where(eq(users.email, email));
      if (userWithEmail) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    const [updatedUser] = await db.update(users)
      .set({
        name: name ?? existingUser.name,
        email: email ?? existingUser.email,
        role: role ?? existingUser.role,
        isSuspended: isSuspended ?? existingUser.isSuspended,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
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

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id: userId } = await params;

    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Only super-admins can delete users' },
        { status: 403 }
      );
    }

    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}