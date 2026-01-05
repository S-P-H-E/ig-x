import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "NEXT_PUBLIC_",
	client: {
		NEXT_PUBLIC_BASE_URL: z.url(),
	},
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		ENCRYPTION_KEY: z.string().length(64),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
