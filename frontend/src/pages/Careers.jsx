import { useState } from "react";
import api from "../api";

export default function Careers() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/career/predict", {});
      setRecs(data.recommendations || []);
      if (data.recommendations?.[0]?.role_name) {
        localStorage.setItem("cc_role", data.recommendations[0].role_name);
      }
    } finally {
      setLoading(false);
    }
  };

  const pick = (role) => localStorage.setItem("cc_role", role);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Career recommendations</h1>
      <p className="text-slate-600 text-sm">
        Hybrid score: 50% ML confidence + 25% skills + 15% aptitude fit + 10% subject alignment.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={run}
        className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Running…" : "Predict top careers"}
      </button>
      <div className="space-y-3">
        {recs.map((r) => (
          <div key={r.role_name} className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="font-semibold text-lg">{r.role_name}</h2>
              <p className="text-sm text-slate-600">{r.why}</p>
              {r.breakdown && (
                <p className="text-xs text-slate-500 mt-1">
                  ML {r.ml_confidence_pct ?? "—"}% · Breakdown weights → {JSON.stringify(r.breakdown)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-brand-700">{r.match_percentage}%</span>
              <button
                type="button"
                onClick={() => pick(r.role_name)}
                className="text-xs rounded border border-slate-200 px-2 py-1"
              >
                Set as focus role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
