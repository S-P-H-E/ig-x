"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { startWorkflow, cancelWorkflow } from "@/lib/actions";

interface WorkflowControlsProps {
  slug: string;
  status: "idle" | "running" | "canceled" | "completed";
}

export default function WorkflowControls({ slug, status }: WorkflowControlsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"start" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRunning = status === "running";
  const isCompleted = status === "completed";
  const isCanceled = status === "canceled";

  const handleStart = async () => {
    if (isRunning || isCompleted) return;

    setIsLoading("start");
    setError(null);

    try {
      const result = await startWorkflow(slug);

      if (!result.success) {
        setError(result.error || "Failed to start workflow");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!isRunning) return;

    setIsLoading("cancel");
    setError(null);

    try {
      const result = await cancelWorkflow(slug);

      if (!result.success) {
        setError(result.error || "Failed to cancel workflow");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleStart}
          disabled={isRunning || isCompleted || isLoading !== null}
          className={`cursor-pointer rounded-xl px-6 py-3 font-medium transition-opacity active:scale-95 ${
            isRunning || isCompleted
              ? "cursor-not-allowed bg-(--foreground)/30 text-(--background)"
              : "bg-(--foreground) text-(--background) hover:opacity-80"
          } disabled:opacity-50`}
        >
          {isLoading === "start" ? (
            <PulseLoader color="white" size={6} />
          ) : isCompleted ? (
            "Completed"
          ) : isCanceled ? (
            "Restart"
          ) : (
            "Start Workflow"
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={!isRunning || isLoading !== null}
          className={`cursor-pointer rounded-xl border px-6 py-3 font-medium transition-opacity active:scale-95 ${
            isRunning
              ? "border-red-500 text-red-500 hover:bg-red-50"
              : "cursor-not-allowed border-(--border) text-(--description)"
          } disabled:opacity-50`}
        >
          {isLoading === "cancel" ? (
            <PulseLoader color="#ef4444" size={6} />
          ) : (
            "Cancel"
          )}
        </button>
      </div>
      {error && (
        <p className="max-w-xs text-right text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
