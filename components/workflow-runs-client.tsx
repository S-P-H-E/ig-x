"use client";

import { useEffect, useState } from "react";
import type { WorkflowRun } from "@/lib/drizzle/schema";

interface WorkflowRunsClientProps {
  slug: string;
  initialStatus: "idle" | "running" | "canceled" | "completed";
  initialRuns: WorkflowRun[];
}

function formatTimeLabel(dateString?: string | null) {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(from?: string | null, nowMs?: number) {
  if (!from || !nowMs) {
    return null;
  }

  const start = new Date(from).getTime();

  if (!Number.isFinite(start) || nowMs <= start) {
    return null;
  }

  const diff = Math.floor((nowMs - start) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function describeRun(run: WorkflowRun, nowMs?: number) {
  const triggerStatus = run.triggerStatus;

  if (triggerStatus === "DELAYED") {
    const at = formatTimeLabel(run.scheduledFor);
    if (at) {
      return `Delayed – starts at ${at}`;
    }
    return "Delayed";
  }

  if (triggerStatus === "QUEUED" || triggerStatus === "WAITING_FOR_DEPLOY") {
    const at = formatTimeLabel(run.createdAt);
    if (at) {
      return `Queued at ${at}`;
    }
    return "Queued";
  }

  if (triggerStatus === "EXECUTING" || triggerStatus === "REATTEMPTING") {
    const duration = formatDuration(run.startedAt, nowMs);
    if (duration) {
      return `Running – for ${duration}`;
    }
    return "Running";
  }

  if (triggerStatus === "COMPLETED") {
    const at = formatTimeLabel(run.completedAt);
    if (at) {
      return `Completed at ${at}`;
    }
    return "Completed";
  }

  if (triggerStatus === "CANCELED") {
    return "Canceled";
  }

  if (
    triggerStatus === "FAILED" ||
    triggerStatus === "CRASHED" ||
    triggerStatus === "SYSTEM_FAILURE" ||
    triggerStatus === "TIMED_OUT"
  ) {
    return "Failed";
  }

  if (run.status === "pending") {
    const at = formatTimeLabel(run.scheduledFor);
    if (at) {
      return `Starts at ${at}`;
    }
    return "Queued";
  }

  if (run.status === "running") {
    return "Running";
  }

  if (run.status === "completed") {
    const at = formatTimeLabel(run.completedAt);
    if (at) {
      return `Completed at ${at}`;
    }
    return "Completed";
  }

  if (run.status === "cancelled") {
    return "Canceled";
  }

  return "Failed";
}

export function WorkflowRunsClient({ slug, initialStatus, initialRuns }: WorkflowRunsClientProps) {
  const [status, setStatus] = useState<WorkflowRunsClientProps["initialStatus"]>(initialStatus);
  const [runs, setRuns] = useState<WorkflowRun[]>(initialRuns);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/workflows/${slug}/runs`);

      if (!response.ok) {
        return;
      }

      const data = await response.json() as { status: WorkflowRunsClientProps["initialStatus"]; runs: WorkflowRun[] };

      setStatus(data.status);
      setRuns(data.runs);
    }, 8000);

    return () => {
      clearInterval(interval);
    };
  }, [slug]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Runs</h2>
        <span className="text-sm text-muted-foreground">{runs.length} total</span>
      </div>
      <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-border p-4">
        {runs.length === 0 ? (
          <p className="text-muted-foreground">Runs will appear here once you start the workflow.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map((run) => {
              const label = describeRun(run, nowMs);
              const isRunning = run.status === "running";
              const isCompleted = run.status === "completed";
              const isCancelled = run.status === "cancelled";

              const statusColor = isCompleted
                ? "text-blue-500"
                : isRunning
                  ? "text-emerald-500"
                  : isCancelled
                    ? "text-red-500"
                    : "text-muted-foreground";

              return (
                <div
                  key={run.runId}
                  className="flex items-center justify-between rounded-lg bg-foreground/5 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">@{run.username}</span>
                    <span className="text-muted-foreground">Run ID: {run.runId}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={statusColor}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


