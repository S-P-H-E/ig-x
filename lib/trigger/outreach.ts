import { schemaTask, task } from "@trigger.dev/sdk";
import z from "zod"
import { api } from "../eden";
import { getUser } from "../session";

export const sendDM = schemaTask({
  id: "send-dm",
  description: "This task sends the generated DM to the instagram profile.",
  schema: z.object({
    username: z.string(),
    template: z.string()
  }),
  run: async ({ username, template }) => {
    const user = await getUser();
    const data = await api.beginWorkflow.post({
      username, template, login: {
        username: user.instaUsername,
        encryptedPassword: user.instaPassword
      }
    })

    return { data }
  }
})

export const outreach = task({
  id: "outreach",
  queue: {
    concurrencyLimit: 1
  },
  run: async (payload: { username: string, template: string }) => {
    // Fetch username and message from payload
    const username = payload.username
    const template = payload.template

    // Send DM
    const { data } = await sendDM.triggerAndWait({ username, template }).unwrap()

    return { 
      message: `${username}'s DM workflow has been completed!`,
      data
    }
  },
});