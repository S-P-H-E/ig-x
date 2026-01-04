import { authClient } from "@/lib/auth-client";
import { db } from "@/lib/drizzle";
import { workflows } from "@/lib/drizzle/schema";
import clsx from "clsx";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AiOutlinePlus,
  AiOutlineClockCircle,
  AiOutlinePlayCircle,
  AiOutlinePause,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";

export default async function Home() {
  const data = await db.select().from(workflows);

  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  const statusConfig = {
    idle: { label: "Idle", icon: AiOutlineClockCircle, color: "text-(--description)" },
    running: { label: "Running", icon: AiOutlinePlayCircle, color: "text-emerald-500" },
    paused: { label: "Paused", icon: AiOutlinePause, color: "text-amber-500" },
    completed: { label: "Completed", icon: AiOutlineCheckCircle, color: "text-blue-500" },
    canceled: { label: "Canceled", icon: AiOutlineCloseCircle, color: "text-red-500" },
  };

	return(
    <div className="flex flex-col p-15 w-7xl mx-auto">
      {/* Navbar */}
      <div className="flex justify-between w-full">
        <Link href="/">
          <h1 className="text-3xl font-semibold">ig-x</h1>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/workflow/new" className="flex gap-2 items-center bg-(--foreground) text-(--background) px-4 py-2 rounded-xl">
            <AiOutlinePlus />
            <p className="font-medium">New Workflow</p>
          </Link>
          <Link href="/profile">
            <Image src={user.image!} className="rounded-full" alt="profile image" width={40} height={40}/>
          </Link>
        </div>
      </div>

      {/* Dashboard */}
      <div className="pt-10">
        {data?.map(w => {
          const status = statusConfig[w.status];
          const StatusIcon = status.icon;

          return (
            <Link href={`/workflow/${w.slug}`} key={w.id} className="w-fit rounded-xl border border-description p-6 inline-block">
              <div className={clsx("flex gap-2 items-center pb-4", status.color)}>
                <StatusIcon className={status.color} />
                <p>{status.label}</p>
              </div>

              <h1>{w.title}</h1>
              <p className="text-(--description)">{w.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
