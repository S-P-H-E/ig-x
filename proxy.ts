import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // if (session.user.onboarding === false) {
  //   return NextResponse.redirect(new URL("/onboarding", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile", "/workflow/:path*"],
};
