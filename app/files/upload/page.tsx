'use client'

import { useState } from 'react';

export default function FileUpload ()  {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') return setError('Only PDFs allowed');
    if (selectedFile.size > 50 * 1024 * 1024) return setError('Max 50MB exceeded');

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/files/upload/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setUrl(data.publicUrl);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleChange} />
      <button onClick={handleUpload} disabled={!file}>Upload PDF</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {url && <p>File uploaded: <a href={url} target="_blank">{url}</a></p>}
    </div>
  );
};
