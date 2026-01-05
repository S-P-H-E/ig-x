"use server"
import { tasks } from "@trigger.dev/sdk";
import { runs } from "@trigger.dev/sdk";
import { redirect } from "next/navigation";
import { db } from "./drizzle";
import { workflows } from "./drizzle/schema";
import { outreach } from "./trigger/outreach";
import { api } from "./eden";

export async function getWorkflows() {
    const data = await db.select().from(workflows)
    return data
}

export async function sendDMs({usernames, template}: {usernames: string[], template: string}) {
    let cumulativeDelay = 0;

    function getNextFutureDate(min: number, max: number): Date {
        const randomMinutes = Math.random() * (max - min) + min;
        cumulativeDelay += randomMinutes * 60 * 1000; // add to total delay
        return new Date(Date.now() + cumulativeDelay);
    }

    const results = []

    for (const username of usernames) {
        const i = usernames.indexOf(username)

        const delay = getNextFutureDate(3, 7)

        console.log(`Run ${i}: Delay until ${delay}.`)

        try {
            const handle = await tasks.trigger<typeof outreach>(
                "outreach",
                { username, template },
                { delay }
            )
    
            results.push({ username, handle });
        } catch (error) {
            console.error("Something went wrong: ", error)
        }
    }

    return results
}

export async function createWorkflowAction(formData: FormData) {
    const title = formData.get("title")?.toString() || ""
    const template = formData.get("template")?.toString() || ""
    const usernamesJson = formData.get("usernames")?.toString() || ""
    const usernames: string[] = usernamesJson ? JSON.parse(usernamesJson) : []

    const { data: workflows } = await api.createWorkflow.post({
        title, template, usernames
    })

    redirect(`/workflow/${workflows?.data?.slug}`)
}