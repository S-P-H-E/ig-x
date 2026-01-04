import Link from "next/link";

export default function Profile() {
  return (
    <div className="p-15 flex flex-col">
      <div className="flex justify-between w-full">
        <Link href="/">
          <p>go back</p>
        </Link>
      </div>
    </div>
  )
}