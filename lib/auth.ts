import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env/server";
import { db } from "./drizzle";
import * as schema from "./drizzle/schema/auth"

export const auth = betterAuth({
    baseURL: env.NEXT_PUBLIC_BASE_URL,
    user: {
      additionalFields: {
        onboarding: {
          type: "boolean",
          required: true,
          defaultValue: false,
        }
      }
    },
    socialProviders: {
      google: { 
          clientId: env.GOOGLE_CLIENT_ID, 
          clientSecret: env.GOOGLE_CLIENT_SECRET
      }, 
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
});
