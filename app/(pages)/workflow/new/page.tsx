import Link from "next/link";

export default function NewWorkflow() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col p-15">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="text-(--description) hover:text-(--foreground)">
          &larr; Back
        </Link>
      </div>

      <div className="mt-10">
        <h1 className="text-3xl font-semibold">New Workflow</h1>
        <p className="mt-2 text-(--description)">Create a new automation workflow</p>
      </div>

      <form className="mt-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="My Workflow"
            className="rounded-xl border border-(--border) bg-transparent px-4 py-3 outline-none focus:border-(--foreground)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="What does this workflow do?"
            rows={3}
            className="resize-none rounded-xl border border-(--border) bg-transparent px-4 py-3 outline-none focus:border-(--foreground)"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-fit cursor-pointer rounded-xl bg-(--foreground) px-6 py-3 font-medium text-(--background) transition-opacity hover:opacity-80 active:scale-95"
        >
          Create Workflow
        </button>
      </form>
    </div>
  );
}
