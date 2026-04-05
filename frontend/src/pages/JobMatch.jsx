import { useState } from "react";
import api from "../api";

export default function JobMatch() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/job-match", {});
      setMatches(data.matches || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Job role matching</h1>
      <p className="text-sm text-slate-600">
        TF–IDF vector of your profile + resume text vs each role&apos;s requirement text, cosine similarity.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={run}
        className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Computing…" : "Compute matches"}
      </button>
      <div className="space-y-2">
        {matches.map((m) => (
          <div key={m.role_name} className="flex justify-between glass rounded-lg px-4 py-3 text-sm">
            <span>{m.role_name}</span>
            <span className="font-semibold text-brand-800">{m.match_percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
