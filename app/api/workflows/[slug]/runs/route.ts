import { NextResponse } from "next/server";
import { syncWorkflowRuns } from "@/lib/trigger/runs";
import { getSession } from "@/lib/session";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const session = await getSession();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const workflow = await syncWorkflowRuns(slug);

  if (!workflow) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({
    status: workflow.status,
    runs: workflow.runs ?? [],
  });
}


