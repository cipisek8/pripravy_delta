'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
};
