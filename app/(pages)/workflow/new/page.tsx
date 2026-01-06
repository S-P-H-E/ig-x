"use client"
import { useState } from "react"
import Papa from "papaparse"
import Dropzone from "@/components/dropzone"
import { createWorkflowAction } from "@/lib/actions"
import { TbFileTypeCsv } from "react-icons/tb";
import { PulseLoader } from "react-spinners";
import Link from "next/link";

export default function New() {
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
    const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null)
    const [usernames, setUsernames] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleDropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length !== 1) return
        const file = e.target.files[0]
        if (!file) return
        setSelectedFileName(file.name)
        setSelectedFileSize(file.size.toString())
    
        // Parse CSV client-side and extract username column
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            const users = (results.data as any[])
              .map(row => (row.username ?? row.Username))
              .filter(Boolean)
            setUsernames(users)
          }
        })
    }

    async function handleCreate(formData: FormData){
        await createWorkflowAction(formData)
    }

    return (
        <div className="flex flex-col justify-center items-center mx-auto w-fit h-dvh">
            <div className="w-md flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold">Create new workflow</h1>
                <p className="text-(--description) text-sm text-center w-sm">This creates a new workflow and you will be navigated to a page where you can begin the workflow.</p>

                <form action={handleCreate} onSubmit={() => setLoading(true)} className="flex flex-col items-center gap-2 w-full mt-4">
                    <Dropzone onChange={handleDropChange} />
                    {selectedFileName && (
                        <div className="flex items-center justify-between border-2 border-(--border) px-4 py-2 rounded-2xl w-full">
                            <div className="flex items-center gap-2">
                                <TbFileTypeCsv size={30}/>
                                <div>
                                    <h1 className="text-sm">{selectedFileName}</h1>
                                    <p className="text-sm text-(--description)">{selectedFileSize} B</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <input type="hidden" name="usernames" value={JSON.stringify(usernames)} />

                    <div className="w-full mt-2 space-y-2">
                        <h1 className="font-semibold">Title</h1>
                        <input type="text" name="title" className="outline-none px-4 py-2 border border-(--border) rounded-xl w-full" placeholder="Enter your workflow title"/>
                    </div>

                    <div className="w-full mt-2 space-y-2">
                        <h1 className="font-semibold">Template</h1>
                        <input type="text" name="template" className="outline-none px-4 py-2 border border-(--border) rounded-xl w-full" placeholder="Enter your workflow template"/>
                    </div>

                    <div className="w-fit flex gap-4 ml-auto mt-4">
                        <Link href="/" className="text-(--foreground) border border-(--border) flex items-center gap-2 px-4 py-1.5 rounded-lg cursor-pointer">
                            Back
                        </Link>
                        <button className="bg-(--foreground) text-(--background) flex items-center gap-2 px-4 py-1.5 rounded-lg cursor-pointer">
                            {loading ? (
                            <>
                                <PulseLoader color='white' size={5}/>
                            </>  
                            ): "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
