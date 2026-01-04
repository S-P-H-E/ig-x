import { defineConfig } from "drizzle-kit";
import { env } from "./lib/env/server";

export default defineConfig({
	schema: "./lib/drizzle/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
