import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, toUserResponse } from '@/lib/auth';
import { CreateUserInput, UserRole } from '@/types/user';
import type { SQL } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isSuspended = searchParams.get('isSuspended');

    // Initialize with proper typing
    const whereClauses: SQL[] = [];
    
    if (role) {
      whereClauses.push(eq(users.role, role as UserRole));
    }

    if (isSuspended) {
      const suspended = isSuspended === 'true';
      whereClauses.push(eq(users.isSuspended, suspended));
    }

    // Build the final query
    const query = db.select()
      .from(users)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

    const userList = await query;
    const response = userList.map(toUserResponse);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/users/route.ts
export async function POST(request: Request) {
  try {
    const { name, email, role, password } = (await request.json()) as CreateUserInput;

    // Check if user exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Set default password based on role
    let finalPassword = password;
    if (!password && (role === 'ADMIN' || role === 'STAFF')) {
      finalPassword = '123'; // Default password for admin and staff
    }

    if (!finalPassword) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(finalPassword);

    // Create user
    const [newUser] = await db.insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        role,
        passwordHash,
        isSuspended: false,
      })
      .returning();

    return NextResponse.json(toUserResponse(newUser), { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}