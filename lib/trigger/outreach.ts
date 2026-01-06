import { schemaTask, task } from "@trigger.dev/sdk";
import z from "zod";
import { eq } from "drizzle-orm";
import { api } from "../eden";
import { db } from "../drizzle";
import { user } from "../drizzle/schema";

export const sendDM = schemaTask({
  id: "send-dm",
  description: "This task sends the generated DM to the instagram profile.",
  schema: z.object({
    userId: z.string(),
    username: z.string(),
    template: z.string()
  }),
  run: async ({ userId, username, template }) => {
    const [account] = await db
      .select({
        instaUsername: user.instaUsername,
        instaPassword: user.instaPassword
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // ! No Instagram account configured for user
    if (!account || !account.instaUsername || !account.instaPassword) {
      return { data: null };
    }

    const data = await api.beginWorkflow.post({
      username,
      template,
      login: {
        username: account.instaUsername,
        encryptedPassword: account.instaPassword
      }
    });

    return { data };
  }
});

interface OutreachPayload {
  userId: string;
  username: string;
  template: string;
}

export const outreach = task({
  id: "outreach",
  queue: {
    concurrencyLimit: 1
  },
  run: async (payload: OutreachPayload) => {
    const { userId, username, template } = payload;

    // Send DM
    const { data } = await sendDM.triggerAndWait({ userId, username, template }).unwrap();

    return {
      message: `${username}'s DM workflow has been completed!`,
      data
    };
  }
});