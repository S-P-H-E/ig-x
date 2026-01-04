import { jsonb, pgTable, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const workflowStatus = pgEnum("status", ["idle", "running", "paused", "canceled", "completed"]);

export const workflows = pgTable("workflows", {
	id: uuid().primaryKey().defaultRandom(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	status: workflowStatus("status").default("idle").notNull(),
	usernames: jsonb().$type<string[]>().notNull(),
	template: text().notNull(),
	slug: text().notNull().unique(),
});

export type Workflows = typeof workflows.$inferSelect;