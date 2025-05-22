import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { jwtVerify, SignJWT } from 'jose';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User, UserResponse } from '@/types/user';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);
const tokenExpiration = '24h';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(storedHash: string, suppliedPassword: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const suppliedHash = scryptSync(suppliedPassword, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(hash), Buffer.from(suppliedHash));
}

export async function generateToken(user: User): Promise<string> {
  return new SignJWT({ 
    id: user.id,
    role: user.role,
    email: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(tokenExpiration)
    .sign(secretKey);
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const [user] = await db.select().from(users).where(eq(users.id, payload.id as string));
    return user || null;
  } catch {
    return null;
  }
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isSuspended: user.isSuspended,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

