import { getFiles } from "@/app/actions/getFiles"
import { DeleteButton } from "./deleteButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function page() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
        return <h1>Nemáte přístup. Musíte být přihlášeni.</h1>;
    }

    const files = await getFiles();

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <h1 className="text-3xl">Soubory</h1>
                    <Link href="/files/upload">
                        <Button className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Nahrát soubor
                        </Button>
                    </Link>
                </div>
                <p className="text-gray-600">PDF uložené v Supabase Storage</p>
            </div>

            {files.length === 0 ? (
                <p className="text-gray-600">Zatím tu nejsou žádné soubory.</p>
            ) : (
                <div className="grid gap-6">
                    {files.map((file) => {
                        const fileName = file.name.split("/").pop() ?? file.name;
                        const url = `https://ebxmbrrbdkqehoeccvdm.supabase.co/storage/v1/object/public/PDFs/${file.name}`;

                        return (
                            <Card key={file.name} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{fileName}</CardTitle>
                                                <CardDescription className="mt-1.5 break-all">{file.name}</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <Button asChild variant="outline" className="flex items-center gap-2">
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                                Otevřít
                                            </a>
                                        </Button>

                                        <DeleteButton filePath={file.name} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}