import { db } from "@/lib/drizzle";
import { workflows, user as userTable, type WorkflowRun } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/session";
import {
  AiOutlineClockCircle,
  AiOutlinePlayCircle,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import WorkflowControls from "@/components/start-workflow-button";
import { syncWorkflowRuns } from "@/lib/trigger/runs";
import { WorkflowRunsClient } from "@/components/workflow-runs-client";

function formatTimeLabel(dateString?: string | null) {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRunStatusLabel(run: WorkflowRun) {
  if (run.status === "pending") {
    if (run.scheduledFor) {
      const time = formatTimeLabel(run.scheduledFor);
      if (time) {
        return `Starts at ${time}`;
      }
    }
    return "Queued";
  }

  if (run.status === "running") {
    return "Running";
  }

  if (run.status === "completed") {
    const time = formatTimeLabel(run.completedAt);
    if (time) {
      return `Completed at ${time}`;
    }
    return "Completed";
  }

  if (run.status === "cancelled") {
    return "Canceled";
  }

  return "Failed";
}

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUser();

  const [result] = await db
    .select({
      workflow: workflows,
      ownerEmail: userTable.email,
    })
    .from(workflows)
    .leftJoin(userTable, eq(workflows.userId, userTable.id))
    .where(eq(workflows.slug, slug));

  if (!result) {
    notFound();
  }

  const workflowRecord = result.workflow;
  const ownerEmail = result.ownerEmail;
  const canEdit = workflowRecord.userId === user.id;

  const workflow = (await syncWorkflowRuns(slug)) ?? workflowRecord;

  const runs: WorkflowRun[] = Array.isArray(workflow.runs) ? workflow.runs : [];

  // Handle usernames - JSONB should return array directly
  const usernames: string[] = Array.isArray(workflow.usernames)
    ? workflow.usernames
    : [];

  const statusConfig = {
    idle: { label: "Idle", icon: AiOutlineClockCircle, color: "text-muted-foreground" },
    running: { label: "Running", icon: AiOutlinePlayCircle, color: "text-emerald-500" },
    completed: { label: "Completed", icon: AiOutlineCheckCircle, color: "text-blue-500" },
    canceled: { label: "Canceled", icon: AiOutlineCloseCircle, color: "text-red-500" },
  };

  const status = statusConfig[workflow.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-10">
      <div className="flex w-full items-center justify-between gap-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          &larr; Back
        </Link>
        <div className={`flex items-center gap-2 ${status.color}`}>
          <StatusIcon />
          <span>{status.label}</span>
        </div>
      </div>

      <div className="mt-10 flex items-start justify-between gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-3xl font-semibold">{workflow.title}</h1>
          <p className="text-sm text-muted-foreground">DM workflow for Instagram usernames listed below.</p>
          {!canEdit && ownerEmail && (
            <p className="text-sm text-muted-foreground">Created by: {ownerEmail}</p>
          )}
        </div>
        <WorkflowControls slug={slug} status={workflow.status} canEdit={canEdit} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Template</h2>
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-border p-4 text-muted-foreground">
          {workflow.template}
        </p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Usernames</h2>
            <span className="text-sm text-muted-foreground">{usernames.length} total</span>
          </div>
          <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-border p-4">
            {usernames.length === 0 ? (
              <p className="text-muted-foreground">No usernames found</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {usernames.map((username, index) => (
                  <span
                    key={`${username}-${index}`}
                    className="rounded-lg bg-foreground/10 px-3 py-1 text-sm"
                  >
                    @{username}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <WorkflowRunsClient slug={slug} initialStatus={workflow.status} initialRuns={runs} />
      </div>

    </div>
  );
}

