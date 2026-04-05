import { useEffect, useState } from "react";
import api from "../api";

export default function Interview() {
  const [role, setRole] = useState(() => localStorage.getItem("cc_role") || "Frontend Developer");
  const [topics, setTopics] = useState([]);

  const load = async () => {
    const enc = encodeURIComponent(role);
    const { data } = await api.get(`/interview/${enc}`);
    setTopics(data.topics || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Interview preparation</h1>
      <div className="flex gap-3 items-end flex-wrap">
        <label className="text-sm flex flex-col gap-1">
          Role
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 min-w-[240px]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>
        <button type="button" onClick={load} className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Load topics
        </button>
      </div>
      <ul className="glass rounded-xl p-6 list-disc pl-6 text-sm text-slate-700 space-y-2">
        {topics.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
