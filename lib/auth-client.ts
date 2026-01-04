
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { env } from "./env/server";

export const authClient = createAuthClient({
  baseURL: env.BASE_URL,
  plugins: [inferAdditionalFields<typeof auth>()]
});
