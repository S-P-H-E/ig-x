import { db } from "@/lib/drizzle";
import { workflows } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AiOutlineClockCircle,
  AiOutlinePlayCircle,
  AiOutlinePause,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [workflow] = await db.select().from(workflows).where(eq(workflows.slug, slug));

  if (!workflow) {
    notFound();
  }

  // Handle usernames - JSONB should return array directly
  const usernames: string[] = Array.isArray(workflow.usernames)
    ? workflow.usernames
    : [];

  const statusConfig = {
    idle: { label: "Idle", icon: AiOutlineClockCircle, color: "text-(--description)" },
    running: { label: "Running", icon: AiOutlinePlayCircle, color: "text-emerald-500" },
    paused: { label: "Paused", icon: AiOutlinePause, color: "text-amber-500" },
    completed: { label: "Completed", icon: AiOutlineCheckCircle, color: "text-blue-500" },
    canceled: { label: "Canceled", icon: AiOutlineCloseCircle, color: "text-red-500" },
  };

  const status = statusConfig[workflow.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col p-15">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="text-(--description) hover:text-(--foreground)">
          &larr; Back
        </Link>
        <div className={`flex items-center gap-2 ${status.color}`}>
          <StatusIcon />
          <span>{status.label}</span>
        </div>
      </div>

      <div className="mt-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">{workflow.title}</h1>
          <p className="mt-2 text-(--description)">{workflow.description}</p>
        </div>
        <button className="cursor-pointer rounded-xl bg-(--foreground) px-6 py-3 font-medium text-(--background) transition-opacity hover:opacity-80 active:scale-95">
          Start Workflow
        </button>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Usernames</h2>
          <span className="text-sm text-(--description)">{usernames.length} total</span>
        </div>
        <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-(--border) p-4">
          {usernames.length === 0 ? (
            <p className="text-(--description)">No usernames found</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {usernames.map((username, index) => (
                <span
                  key={`${username}-${index}`}
                  className="rounded-lg bg-(--foreground)/10 px-3 py-1 text-sm"
                >
                  @{username}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Template</h2>
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-(--border) p-4 text-(--description)">
          {workflow.template}
        </p>
      </div>
    </div>
  );
}
