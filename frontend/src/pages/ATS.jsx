import { useState } from "react";
import api from "../api";

export default function ATS() {
  const [role, setRole] = useState(() => localStorage.getItem("cc_role") || "Data Analyst");
  const [data, setData] = useState(null);

  const score = async () => {
    const { data: d } = await api.post("/ats/score", { role_name: role });
    setData(d);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">ATS resume scoring</h1>
      <p className="text-sm text-slate-600">
        Uses latest uploaded resume text + your skills. Weighted: keywords 35%, sections 20%, projects 20%, certs 10%,
        formatting 10%, alignment 5%.
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm flex flex-col gap-1">
          Target role
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>
        <button type="button" onClick={score} className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Score resume
        </button>
      </div>
      {data && !data.error && (
        <div className="glass rounded-xl p-6 space-y-3 text-sm">
          <p className="text-3xl font-display font-bold text-brand-700">{data.ats_score}/100</p>
          <p className="text-slate-600">{data.weights_note}</p>
          {data.missing_keywords?.length > 0 && (
            <div>
              <p className="font-medium">Missing keywords</p>
              <p className="text-slate-700">{data.missing_keywords.join(", ")}</p>
            </div>
          )}
          <ul className="list-disc pl-5 text-slate-700">
            {data.suggestions?.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
