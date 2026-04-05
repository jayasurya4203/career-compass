import { useEffect, useState } from "react";
import api from "../api";

export default function SkillGap() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem("cc_role") || "");
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/roles");
      setRoles(data.roles || []);
      if (!role && data.roles?.[0]) setRole(data.roles[0]);
    })();
  }, []);

  const analyze = async () => {
    const { data } = await api.post("/skill-gap/analyze", { role_name: role });
    setResult(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Skill gap analysis</h1>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col text-sm gap-1">
          Target role
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 min-w-[220px]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={analyze} className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Analyze gaps
        </button>
      </div>
      {result && !result.error && (
        <div className="glass rounded-xl p-6 space-y-3 text-sm">
          <p>
            Readiness: <strong className="text-brand-800 text-lg">{result.readiness_score}%</strong>
          </p>
          <p>Missing skills ({100 - result.readiness_score}% gap):</p>
          <ul className="list-disc pl-5 text-slate-700">
            {result.missing_skills?.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="text-slate-600">Priority order follows required-skill list order.</p>
        </div>
      )}
    </div>
  );
}
