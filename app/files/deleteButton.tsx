'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DeleteButton = ({ filePath }: { filePath: string }) => {
const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);

    const res = await fetch("/files/delete", {
      method: "POST",
      body: JSON.stringify({filePath }),
      headers: { "Content-Type": "application/json" }
    });

    setLoading(false);

    if (res.ok) {
      router.refresh(); // ⬅️ refreshes current page
    } else {
      alert("Error deleting file.");
    }
  };

    return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="destructive"
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "Mažu…" : "Smazat"}
    </Button>
  );
};
