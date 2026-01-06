import SignIn from "@/components/sign-in";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await getSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">Welcome to ig-x</h1>
      <p className="mt-2 text-(--description)">Sign in to continue</p>
      <div className="mt-8">
        <SignIn />
      </div>
    </div>
  );
}
