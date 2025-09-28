import { pgTable, uuid, varchar, text, numeric, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  items: jsonb('items').notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  statusIdx: index('orders_status_idx').on(table.status),
  customerIdx: index('orders_customer_idx').on(table.customerId),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  createdByUser: one(users, { fields: [orders.createdBy], references: [users.id] }),
  payments: many(payments),
}));

// Import payments for relations
import { payments } from './payments';