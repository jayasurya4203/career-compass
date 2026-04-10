import { useEffect, useMemo, useState } from "react";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

const ROLE_KEY = "cc_role";

export default function SkillGap() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/roles");
        const list = data.roles || [];
        setRoles(list);
        setRole((r) => {
          if (r && list.includes(r)) return r;
          const saved = localStorage.getItem(ROLE_KEY);
          if (saved && list.includes(saved)) return saved;
          return list[0] || "";
        });
      } catch {
        setRoles([]);
      }
    })();
  }, []);

  const analyze = async () => {
    if (!role) return;
    setErr("");
    setLoading(true);
    localStorage.setItem(ROLE_KEY, role);
    try {
      const { data } = await api.post("/skill-gap/analyze", { role_name: role });
      if (data.error) {
        setErr(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (ex) {
      setErr(ex.response?.data?.error || "Analysis failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const readiness = result?.readiness_score ?? 0;
  const gap = Math.max(0, 100 - readiness);

  const ringStyle = useMemo(
    () => ({
      background: `conic-gradient(from -90deg, rgb(79 70 229) ${(readiness / 100) * 360}deg, rgb(226 232 240) ${(readiness / 100) * 360}deg)`,
    }),
    [readiness]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Skill gap analysis"
        subtitle="Maps your profile skills against the role catalog: readiness ring, what you already match, and ordered gaps to close before interviews."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end flex-wrap">
        <label className="text-sm max-w-sm flex-1">
          <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Target role</span>
          <select
            className="input-saas w-full"
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
        <button
          type="button"
          onClick={analyze}
          disabled={loading || !role}
          className="btn-primary shrink-0 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Run gap analysis"}
        </button>
      </div>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      {result && !result.error ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center border border-slate-100/80 dark:border-slate-700/80">
            <h2 className="font-display text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide self-start w-full mb-4">
              Readiness
            </h2>
            <div className="relative h-36 w-36 shrink-0">
              <div className="absolute inset-0 rounded-full dark:opacity-90" style={ringStyle} />
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-inner">
                <span className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">{readiness}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">matched</span>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-slate-100">{gap}%</strong> of required skills still to close for{" "}
              <strong>{result.role_name}</strong>.
            </p>
          </div>

          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-5 sm:p-6 border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15">
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Skills you match
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Already present in your profile (normalized).</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(result.existing_skills_matched || []).length ? (
                  (result.existing_skills_matched || []).map((s) => (
                    <li
                      key={s}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-200/80 dark:ring-emerald-800"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No direct matches — add skills on your profile.</li>
                )}
              </ul>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-6 border border-amber-200/60 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/15">
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Priority gaps
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Same order as the role&apos;s required-skills list.</p>
              <ol className="mt-4 space-y-2 text-sm text-slate-800 dark:text-slate-200 list-decimal pl-4">
                {(result.priority_learning_order || result.missing_skills || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {!result && !err ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Pick a role and run analysis to see your match breakdown.</p>
      ) : null}
    </div>
  );
}
