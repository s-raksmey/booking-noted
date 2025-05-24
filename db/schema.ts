import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] }).notNull(),
  passwordHash: text('password_hash').notNull(),
  isSuspended: integer('is_suspended', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
    roleIdx: index('role_idx').on(table.role),
  };
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    tokenIdx: uniqueIndex('token_idx').on(table.token),
    passwordResetUserIdx: index('password_reset_user_idx').on(table.userId),
  };
});

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  location: text('location').notNull(),
  features: text('features').notNull().default('[]'),
  autoApprove: integer('auto_approve', { mode: 'boolean' }).notNull().default(false),
  restrictedHours: text('restricted_hours'),
  suspendedUntil: integer('suspended_until', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    nameIdx: index('room_name_idx').on(table.name),
  };
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull().references(() => users.id),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  equipment: text('equipment').notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => {
  return {
    roomIdx: index('booking_room_idx').on(table.roomId),
    bookingUserIdx: index('booking_user_idx').on(table.userId),
    statusIdx: index('booking_status_idx').on(table.status),
  };
});