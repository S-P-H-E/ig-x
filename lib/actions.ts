"use server"
import { tasks, runs } from "@trigger.dev/sdk";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { workflows, user, type WorkflowRun } from "./drizzle/schema";
import { outreach } from "./trigger/outreach";
import { api } from "./eden";
import { encrypt } from "./crypto";
import { getUser } from "./session";

interface InstagramLogin {
    username: string;
    encryptedPassword: string;
}

export async function sendDMs({usernames, template, login}: {usernames: string[], template: string, login: InstagramLogin}): Promise<WorkflowRun[]> {
    let cumulativeDelay = 0;

    function getNextFutureDate(min: number, max: number): Date {
        const randomMinutes = Math.random() * (max - min) + min;
        cumulativeDelay += randomMinutes * 60 * 1000; // add to total delay
        return new Date(Date.now() + cumulativeDelay);
    }

    const results: WorkflowRun[] = []

    for (const username of usernames) {
        const i = usernames.indexOf(username)

        const delay = getNextFutureDate(3, 7)

        console.log(`Run ${i}: Delay until ${delay}.`)

        try {
            const handle = await tasks.trigger<typeof outreach>(
                "outreach",
                { username, template, login },
                { delay }
            )

            results.push({
                username,
                runId: handle.id,
                status: "pending"
            });
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

    const { data: workflowData } = await api.createWorkflow.post({
        title, template, usernames
    })

    redirect(`/workflow/${workflowData?.data?.slug}`)
}

export async function startWorkflow(slug: string) {
    // Get the workflow
    const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.slug, slug));

    if (!workflow) {
        return { success: false, error: "Workflow not found" };
    }

    // Check if workflow is already running
    if (workflow.status === "running") {
        return { success: false, error: "Workflow is already running" };
    }

    // Check if Instagram account is connected and get credentials
    const instagramAccount = await getInstagramAccount();
    if (!instagramAccount) {
        return { success: false, error: "No Instagram account connected. Please connect your account in Profile settings." };
    }

    // Get usernames from workflow
    const usernames: string[] = Array.isArray(workflow.usernames)
        ? workflow.usernames
        : [];

    if (usernames.length === 0) {
        return { success: false, error: "No usernames in workflow" };
    }

    // Trigger the DMs and get run information
    const workflowRuns = await sendDMs({
        usernames,
        template: workflow.template,
        login: instagramAccount
    });

    // Update workflow status to running and store run IDs
    await db
        .update(workflows)
        .set({
            status: "running",
            runs: workflowRuns
        })
        .where(eq(workflows.slug, slug));

    return { success: true };
}

export async function cancelWorkflow(slug: string) {
    // Get the workflow
    const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.slug, slug));

    if (!workflow) {
        return { success: false, error: "Workflow not found" };
    }

    if (workflow.status !== "running") {
        return { success: false, error: "Workflow is not running" };
    }

    const currentRuns = workflow.runs || [];

    // Cancel all pending runs
    for (const run of currentRuns) {
        if (run.status === "pending") {
            try {
                await runs.cancel(run.runId);
                run.status = "cancelled";
            } catch (error) {
                console.error(`Failed to cancel run ${run.runId}:`, error);
            }
        }
    }

    // Update workflow status to canceled
    await db
        .update(workflows)
        .set({
            status: "canceled",
            runs: currentRuns
        })
        .where(eq(workflows.slug, slug));

    return { success: true };
}

export async function getInstagramAccount() {
    const currentUser = await getUser();

    const result = await db
        .select({
            instaUsername: user.instaUsername,
            instaPassword: user.instaPassword,
        })
        .from(user)
        .where(eq(user.id, currentUser.id))
        .limit(1);

    if (result.length === 0 || !result[0].instaUsername || !result[0].instaPassword) {
        return null;
    }

    return {
        username: result[0].instaUsername,
        encryptedPassword: result[0].instaPassword
    };
}

export async function saveInstagramAccount(username: string, password: string) {
    const currentUser = await getUser();

    const encryptedPassword = encrypt(password);

    await db
        .update(user)
        .set({
            instaUsername: username,
            instaPassword: encryptedPassword,
        })
        .where(eq(user.id, currentUser.id));

    return { success: true };
}

export async function deleteInstagramAccount() {
    const currentUser = await getUser();

    await db
        .update(user)
        .set({
            instaUsername: null,
            instaPassword: null,
        })
        .where(eq(user.id, currentUser.id));

    return { success: true };
}