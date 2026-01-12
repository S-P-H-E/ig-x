"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  const handleClick = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer rounded-xl border border-border px-4 py-2 text-foreground transition-opacity hover:opacity-70 active:scale-95"
    >
      Sign out
    </button>
  );
}
