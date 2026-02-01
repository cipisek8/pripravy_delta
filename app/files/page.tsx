import { getFiles } from "@/app/actions/getFiles"
import { DeleteButton } from "./deleteButton";

export default async function page() {
    const files = await getFiles();

    return (
        <div>
            {files.map(file => (
                <div key={file.name.split("/").pop()}>
                    <div className="flex items-center justify-between">
                        <div><a href={`https://ebxmbrrbdkqehoeccvdm.supabase.co/storage/v1/object/public/PDFs/${file.name}`} target="_blank">{file.name.split("/").pop()}</a></div>
                        <div>
                            {`[${file.name.split("/").pop()}](https://ebxmbrrbdkqehoeccvdm.supabase.co/storage/v1/object/PDFs/${file.name})`}
                            <DeleteButton filePath={file.name} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}