// types/user.ts
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  isSuspended?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  redirectTo?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordResetInput {
  newPassword: string;
  token: string;
}

// Types for NextAuth
export interface UserSession {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface TokenSet {
  id?: string;
  role?: UserRole;
  email?: string;
  [key: string]: any;
}

export interface SessionParams {
  session: UserSession;
  token: TokenSet;
}

export interface JWTParams {
  token: TokenSet;
  user?: User;
}