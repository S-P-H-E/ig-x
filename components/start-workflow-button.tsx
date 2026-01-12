"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { startWorkflow, cancelWorkflow, deleteWorkflowAction } from "@/lib/actions";
import { AiOutlineDelete } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkflowControlsProps {
  slug: string;
  status: "idle" | "running" | "canceled" | "completed";
  canEdit: boolean;
}

export default function WorkflowControls({ slug, status, canEdit }: WorkflowControlsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"start" | "cancel" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    setIsLoading("delete");
    setError(null);

    try {
      const result = await deleteWorkflowAction(slug);

      if (!result.success) {
        setError(result.error || "Failed to delete workflow");
        setShowDeleteConfirm(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            disabled={isRunning || isCompleted || isLoading !== null}
            className={`cursor-pointer rounded-xl px-6 py-3 font-medium transition-opacity active:scale-95 ${
              isRunning || isCompleted
                ? "cursor-not-allowed bg-foreground/30 text-background"
                : "bg-foreground text-background hover:opacity-80"
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
                : "cursor-not-allowed border-border text-muted-foreground"
            } disabled:opacity-50`}
          >
            {isLoading === "cancel" ? (
              <PulseLoader color="#ef4444" size={6} />
            ) : (
              "Cancel"
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isRunning || isLoading !== null}
            className={`cursor-pointer rounded-xl border px-4 py-3 font-medium transition-opacity active:scale-95 ${
              isRunning
                ? "cursor-not-allowed border-border text-muted-foreground"
                : "border-red-500 text-red-500 hover:bg-red-50"
            } disabled:opacity-50`}
            title={isRunning ? "Cancel workflow before deleting" : "Delete workflow"}
          >
            <AiOutlineDelete size={18} />
          </button>
        </div>
        {error && (
          <p className="max-w-xs text-right text-sm text-red-500">{error}</p>
        )}
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading === "delete"}
              className="flex-1 cursor-pointer rounded-xl border border-border py-2 transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading === "delete"}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-red-500 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading === "delete" ? (
                <PulseLoader color="white" size={5} />
              ) : (
                "Delete"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
