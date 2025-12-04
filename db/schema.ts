import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("members_group_idx").on(table.groupId)]
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    paidById: uuid("paid_by_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index("expenses_group_idx").on(table.groupId),
    index("expenses_paid_by_idx").on(table.paidById)
  ]
);

export const expenseShares = pgTable(
  "expense_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull()
  },
  (table) => [uniqueIndex("expense_member_unique").on(table.expenseId, table.memberId)]
);

export const balances = pgTable(
  "balances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    creditorId: uuid("creditor_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    debtorId: uuid("debtor_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("balances_unique_pair").on(table.groupId, table.creditorId, table.debtorId),
    index("balances_creditor_idx").on(table.creditorId),
    index("balances_debtor_idx").on(table.debtorId)
  ]
);

export const groupRelations = relations(groups, ({ many }) => ({
  members: many(members),
  expenses: many(expenses),
  balances: many(balances)
}));

export const memberRelations = relations(members, ({ one, many }) => ({
  group: one(groups, {
    fields: [members.groupId],
    references: [groups.id]
  }),
  paidExpenses: many(expenses),
  shares: many(expenseShares),
  credits: many(balances, { relationName: "creditor" }),
  debits: many(balances, { relationName: "debtor" })
}));

export const expenseRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id]
  }),
  paidBy: one(members, {
    fields: [expenses.paidById],
    references: [members.id]
  }),
  shares: many(expenseShares)
}));

export const shareRelations = relations(expenseShares, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseShares.expenseId],
    references: [expenses.id]
  }),
  member: one(members, {
    fields: [expenseShares.memberId],
    references: [members.id]
  })
}));

export const balanceRelations = relations(balances, ({ one }) => ({
  group: one(groups, {
    fields: [balances.groupId],
    references: [groups.id]
  }),
  creditor: one(members, {
    fields: [balances.creditorId],
    references: [members.id]
  }),
  debtor: one(members, {
    fields: [balances.debtorId],
    references: [members.id]
  })
}));

export type Group = typeof groups.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseShare = typeof expenseShares.$inferSelect;
export type Balance = typeof balances.$inferSelect;
