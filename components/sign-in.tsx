"use client";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  const handleClick = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin + "/",
    });
  };

  return (
    <button
      onClick={handleClick}
      className="flex cursor-pointer items-center gap-3 rounded-xl bg-(--foreground) px-6 py-3 text-(--background) transition-opacity hover:opacity-80 active:scale-95"
    >
      <FcGoogle className="text-xl" />
      <span className="font-medium">Continue with Google</span>
    </button>
  );
}
