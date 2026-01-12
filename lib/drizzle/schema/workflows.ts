import { jsonb, pgTable, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const workflowStatus = pgEnum("status", ["idle", "running", "canceled", "completed"]);

export type WorkflowRun = {
	username: string;
	runId: string;
	status: "pending" | "running" | "completed" | "cancelled" | "failed";
	triggerStatus?: string;
	createdAt?: string;
	scheduledFor?: string;
	startedAt?: string;
	completedAt?: string;
};

export const workflows = pgTable("workflows", {
	id: uuid().primaryKey().defaultRandom(),
	created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	title: text().notNull(),
	status: workflowStatus("status").default("idle").notNull(),
	usernames: jsonb().$type<string[]>().notNull(),
	template: text().notNull(),
	slug: text().notNull().unique(),
	runs: jsonb().$type<WorkflowRun[]>().default([]),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export type Workflows = typeof workflows.$inferSelect;