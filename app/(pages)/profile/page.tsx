import SignOut from "@/components/sign-out";
import { getUser } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";

export default async function Profile() {
  const user = await getUser();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col p-15">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="text-(--description) hover:text-(--foreground)">
          &larr; Back
        </Link>
        <SignOut />
      </div>

      <div className="mt-16 flex flex-col items-center">
        <Image
          src={user.image ?? "/avatar.png"}
          alt="Profile"
          width={100}
          height={100}
          className="rounded-full"
        />
        <h1 className="mt-6 text-2xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-(--description)">{user.email}</p>
      </div>
    </div>
  );
}
