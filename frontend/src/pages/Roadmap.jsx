import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

const ROLE_KEY = "cc_role";

const LEVELS = [
  { id: "beginner", label: "Beginner", desc: "Foundations" },
  { id: "intermediate", label: "Intermediate", desc: "Core depth" },
  { id: "advanced", label: "Advanced", desc: "Expertise" },
  { id: "placement", label: "Placement sprint", desc: "Interview-ready" },
];

const STAGE_COLORS = {
  beginner: "from-sky-500/20 to-sky-600/10 border-sky-200/80 dark:border-sky-800/60",
  intermediate: "from-violet-500/20 to-violet-600/10 border-violet-200/80 dark:border-violet-800/60",
  advanced: "from-amber-500/15 to-amber-600/10 border-amber-200/80 dark:border-amber-800/60",
  placement: "from-emerald-500/20 to-emerald-600/10 border-emerald-200/80 dark:border-emerald-800/60",
};

const STAGE_DOT = {
  beginner: "bg-sky-500",
  intermediate: "bg-violet-500",
  advanced: "bg-amber-500",
  placement: "bg-emerald-500",
};

export default function Roadmap() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "Data Analyst");
  const [level, setLevel] = useState("placement");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: r } = await api.get("/roles");
        setRoles(r.roles || []);
      } catch {
        setRoles([]);
      }
    })();
  }, []);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    localStorage.setItem(ROLE_KEY, role);
    try {
      const { data: d } = await api.post("/roadmap", { role_name: role, level });
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [role, level]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const stepsByStage = useMemo(() => {
    const steps = data?.full_steps || [];
    const m = {};
    for (const s of steps) {
      const st = s.stage || "other";
      if (!m[st]) m[st] = [];
      m[st].push(s);
    }
    return m;
  }, [data]);

  const highlight = data?.highlighted_track || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning roadmap"
        subtitle="Staged skills path plus a generated weekly plan. Switch track emphasis for where you are in the semester — beginner through placement sprint."
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end flex-wrap">
          <label className="text-sm max-w-xs">
            <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Role</span>
            {roles.length > 0 ? (
              <select className="input-saas w-full min-w-[14rem]" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <input className="input-saas w-full" value={role} onChange={(e) => setRole(e.target.value)} />
            )}
          </label>
          <button type="button" onClick={fetchRoadmap} disabled={loading} className="btn-primary shrink-0 self-start sm:self-auto">
            {loading ? "Refreshing…" : "Reload"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              type="button"
              onClick={() => setLevel(lv.id)}
              className={`rounded-xl px-3 py-2 text-left text-xs sm:text-sm ring-1 transition ${
                level === lv.id
                  ? "bg-gradient-to-r from-brand-600/15 to-accent-600/10 text-brand-900 dark:text-brand-100 ring-brand-300 dark:ring-brand-600/50"
                  : "bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-600 hover:ring-brand-200"
              }`}
            >
              <span className="font-semibold block">{lv.label}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{lv.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {data?.error ? (
        <p className="text-red-600 dark:text-red-400 text-sm">{data.error}</p>
      ) : null}

      {highlight.length > 0 ? (
        <div className="glass rounded-2xl p-5 sm:p-6 border border-brand-100/80 dark:border-brand-900/40 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-950/30">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Focus track — {level}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {highlight.map((h) => (
              <li
                key={h}
                className="rounded-lg px-3 py-1.5 text-sm bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 ring-1 ring-slate-200/80 dark:ring-slate-600"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5 sm:p-6 border border-slate-100/80 dark:border-slate-700/80">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Full learning path</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Ordered stages with milestones from the role catalog.</p>
          <div className="space-y-8">
            {Object.entries(stepsByStage).map(([stage, items]) => (
              <div key={stage}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full ${STAGE_DOT[stage] || "bg-slate-400"}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stage}</h3>
                </div>
                <ol className="relative border-l border-slate-200 dark:border-slate-600 ml-1.5 space-y-3 pl-6">
                  {items.map((s) => (
                    <li key={s.step} className="relative">
                      <span className="absolute -left-[1.36rem] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-4 ring-white dark:ring-slate-900">
                        {s.step}
                      </span>
                      <div
                        className={`rounded-xl border px-4 py-3 bg-gradient-to-br ${
                          STAGE_COLORS[stage] || "from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/40 border-slate-200/80 dark:border-slate-600"
                        }`}
                      >
                        <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{s.title}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-100/80 dark:border-slate-700/80">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Weekly plan sketch</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              ~{data?.estimated_weeks ?? "—"} weeks at ~3 tasks per week (adjust to your pace).
            </p>
            <div className="space-y-3 max-h-[min(70vh,36rem)] overflow-y-auto pr-1">
              {(data?.weekly_plan || []).map((w) => (
                <div
                  key={w.week}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-600 bg-white/60 dark:bg-slate-800/40 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Week {w.week}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                    {(w.tasks || []).map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-brand-500 dark:text-brand-400">▸</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
