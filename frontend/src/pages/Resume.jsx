import { useState } from "react";
import api from "../api";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [err, setErr] = useState("");

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParsed(data.parsed);
    } catch (ex) {
      setErr(ex.response?.data?.error || "Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Resume upload & parser</h1>
      <p className="text-sm text-slate-600">PDF or DOCX. Extracts contact info, skills keywords, education hints.</p>
      <form onSubmit={upload} className="glass rounded-xl p-6 space-y-4 max-w-lg">
        <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Upload & parse
        </button>
      </form>
      {parsed && (
        <div className="glass rounded-xl p-6 text-sm space-y-2">
          <h2 className="font-semibold">Extracted</h2>
          <pre className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-3 rounded-lg overflow-auto">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
