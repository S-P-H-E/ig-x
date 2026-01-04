"use client"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();

  const handleClick = async() => {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin + "/"
    });

    console.log(data)
  }
  return (
    <button onClick={handleClick} className="cursor-pointer px-4 py-2 bg-black text-white active:scale-90">
      Sign In
    </button>
  )
}