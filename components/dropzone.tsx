import { TbCloudUpload } from "react-icons/tb";

export default function Dropzone({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="w-full h-fit rounded-2xl border-3 border-dashed border-border">
            <label htmlFor="dropzone-file">
                <div className="p-5 size-full cursor-pointer rounded-2xl flex flex-col items-center justify-center hover:bg-[]">
                    <TbCloudUpload size={30}/>
                    <h1>Drag and drop your CSV here</h1>
                </div>
                <input required id="dropzone-file" name="dropzone-file" onChange={onChange} type="file" accept=".csv,text/csv" className="hidden"/>
            </label>
        </div>
    )
}
