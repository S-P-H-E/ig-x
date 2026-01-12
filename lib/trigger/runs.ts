import { eq } from "drizzle-orm";
import { runs } from "@trigger.dev/sdk";
import { db } from "../drizzle";
import { workflows, type WorkflowRun, type Workflows } from "../drizzle/schema";

function mapRunStatus(status: string): WorkflowRun["status"] {
  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "CANCELED") {
    return "cancelled";
  }

  if (status === "FAILED" || status === "CRASHED" || status === "SYSTEM_FAILURE" || status === "TIMED_OUT") {
    return "failed";
  }

  if (status === "EXECUTING" || status === "REATTEMPTING") {
    return "running";
  }

  return "pending";
}

export async function syncWorkflowRuns(slug: string): Promise<Workflows | null> {
  const [workflow] = await db.select().from(workflows).where(eq(workflows.slug, slug));

  if (!workflow) {
    return null;
  }

  const existingRuns: WorkflowRun[] = Array.isArray(workflow.runs) ? workflow.runs : [];

  if (existingRuns.length === 0) {
    return workflow;
  }

  const updatedRuns: WorkflowRun[] = [];

  for (const run of existingRuns) {
    const triggerRun = await runs.retrieve(run.runId);

    const mappedStatus = mapRunStatus(triggerRun.status);

    updatedRuns.push({
      ...run,
      status: mappedStatus,
      triggerStatus: triggerRun.status,
      createdAt: triggerRun.createdAt?.toISOString(),
      scheduledFor: triggerRun.delayedUntil?.toISOString(),
      startedAt: triggerRun.startedAt?.toISOString(),
      completedAt: triggerRun.finishedAt?.toISOString(),
    });
  }

  const previousStatus = workflow.status;

  const allCancelled = updatedRuns.every((run) => run.status === "cancelled");
  const allCompleted = updatedRuns.every((run) => run.status === "completed");
  const anyRunningOrPending = updatedRuns.some(
    (run) => run.status === "running" || run.status === "pending",
  );

  let newStatus = previousStatus;

  if (allCancelled) {
    newStatus = "canceled";
  } else if (anyRunningOrPending) {
    newStatus = "running";
  } else if (allCompleted) {
    newStatus = previousStatus === "canceled" ? "canceled" : "completed";
  }

  const [updatedWorkflow] = await db
    .update(workflows)
    .set({
      runs: updatedRuns,
      status: newStatus,
    })
    .where(eq(workflows.slug, slug))
    .returning();

  return updatedWorkflow ?? workflow;
}

