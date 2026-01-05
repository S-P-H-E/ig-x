import { headers } from "next/headers";
import { authClient } from "./auth-client";

export async function getUser() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  // Auth is handled by proxy.ts - user will always exist on protected routes
  return session!.user;
}

export async function getSession() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  return session;
}
