import { db } from "@/lib/drizzle";
import { workflows } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { getUser } from "@/lib/session";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlinePlus,
  AiOutlineClockCircle,
  AiOutlinePlayCircle,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";

export default async function Home() {
  const user = await getUser();
  const data = await db
    .select()
    .from(workflows)
    .where(eq(workflows.userId, user.id))
    .orderBy(desc(workflows.created_at));

  const statusConfig = {
    idle: { label: "Idle", icon: AiOutlineClockCircle, color: "text-(--description)" },
    running: { label: "Running", icon: AiOutlinePlayCircle, color: "text-emerald-500" },
    completed: { label: "Completed", icon: AiOutlineCheckCircle, color: "text-blue-500" },
    canceled: { label: "Canceled", icon: AiOutlineCloseCircle, color: "text-red-500" },
  };

	return(
    <div className="flex flex-col p-15 w-7xl mx-auto">
      {/* Navbar */}
      <div className="flex justify-between w-full">
        <h1 className="text-3xl font-semibold">ig-x</h1>
        <div className="flex gap-4 items-center">
          <Link href="/workflow/new" className="flex gap-2 items-center bg-foreground text-background px-4 py-2 rounded-xl">
            <AiOutlinePlus />
            <p className="font-medium">New Workflow</p>
          </Link>
          <Link href="/profile">
            <Image src={user.image!} className="rounded-full" alt="profile image" width={40} height={40}/>
          </Link>
        </div>
      </div>

      {/* Dashboard */}
      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center pt-32">
          <p className="text-muted-foreground">No workflows created yet</p>
        </div>
      ) : (
        <div className="pt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((w) => {
            const status = statusConfig[w.status];
            const StatusIcon = status.icon;

            return (
              <Link href={`/workflow/${w.slug}`} key={w.id} className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-background p-6 transition hover:border-(--foreground)/40">
                <div>
                  <div className={clsx("inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium", status.color)}>
                    <StatusIcon className={status.color} />
                    <p>{status.label}</p>
                  </div>
                  <h1 className="mt-4 text-lg font-semibold">{w.title}</h1>
                  {w.template && (
                    <p className="mt-3 text-sm text-description max-h-20 overflow-hidden">
                      {w.template}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-description">
                  <span>View workflow</span>
                  <span className="transition group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
