import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id').references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  templateId: varchar('template_id', { length: 100 }),
  isSent: boolean('is_sent').default(false),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  recipientIdx: index('notifications_recipient_idx').on(table.recipientId),
  typeIdx: index('notifications_type_idx').on(table.type),
  sentIdx: index('notifications_sent_idx').on(table.isSent),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.recipientId], references: [users.id] }),
}));