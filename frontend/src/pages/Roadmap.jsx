import { useEffect, useState } from "react";
import api from "../api";

export default function Roadmap() {
  const [role, setRole] = useState(() => localStorage.getItem("cc_role") || "Data Analyst");
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: d } = await api.post("/roadmap", { role_name: role, level: "placement" });
      setData(d);
    })();
  }, [role]);

  const reload = async () => {
    const { data: d } = await api.post("/roadmap", { role_name: role, level: "placement" });
    setData(d);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Learning roadmap</h1>
      <div className="flex gap-3 items-end flex-wrap">
        <label className="text-sm flex flex-col gap-1">
          Role
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 min-w-[240px]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>
        <button type="button" onClick={reload} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
          Refresh
        </button>
      </div>
      {data?.full_steps && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-5">
            <h2 className="font-semibold mb-3">Full path</h2>
            <ol className="text-sm space-y-2 list-decimal pl-5 text-slate-700">
              {data.full_steps.map((s) => (
                <li key={s.step}>
                  <span className="text-xs uppercase text-slate-400">{s.stage}</span> — {s.title}
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-xl p-5">
            <h2 className="font-semibold mb-3">Weekly plan (sample)</h2>
            <ul className="text-sm space-y-3 text-slate-700">
              {data.weekly_plan?.map((w) => (
                <li key={w.week}>
                  <strong>Week {w.week}</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {w.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-3">Estimated weeks: ~{data.estimated_weeks}</p>
          </div>
        </div>
      )}
    </div>
  );
}
