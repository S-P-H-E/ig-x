import { schemaTask, task } from "@trigger.dev/sdk";
import z from "zod"
import { api } from "../eden";

const loginSchema = z.object({
  username: z.string(),
  encryptedPassword: z.string()
});

export const sendDM = schemaTask({
  id: "send-dm",
  description: "This task sends the generated DM to the instagram profile.",
  schema: z.object({
    username: z.string(),
    template: z.string(),
    login: loginSchema
  }),
  run: async ({ username, template, login }) => {
    const data = await api.beginWorkflow.post({
      username,
      template,
      login: {
        username: login.username,
        encryptedPassword: login.encryptedPassword
      }
    })

    return { data }
  }
})

interface OutreachPayload {
  username: string;
  template: string;
  login: {
    username: string;
    encryptedPassword: string;
  };
}

export const outreach = task({
  id: "outreach",
  queue: {
    concurrencyLimit: 1
  },
  run: async (payload: OutreachPayload) => {
    const { username, template, login } = payload;

    // Send DM
    const { data } = await sendDM.triggerAndWait({ username, template, login }).unwrap()

    return {
      message: `${username}'s DM workflow has been completed!`,
      data
    }
  },
});