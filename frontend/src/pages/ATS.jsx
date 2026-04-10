import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

function ScoreRing({ score }) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  const deg = (s / 100) * 360;
  return (
    <div className="relative mx-auto h-40 w-40 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, rgb(79 70 229) ${deg}deg, rgb(226 232 240) ${deg}deg)`,
        }}
      />
      <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <span className="font-display text-4xl font-bold text-slate-900">{s}</span>
        <span className="text-xs font-medium text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

const roleStorageKey = "cc_role";

export default function ATS() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem(roleStorageKey) || "Data Analyst");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: d } = await api.get("/roles");
        setRoles(d.roles || []);
      } catch {
        setRoles([]);
      }
    })();
  }, []);

  const score = async () => {
    setErr("");
    setLoading(true);
    setData(null);
    localStorage.setItem(roleStorageKey, role);
    try {
      const { data: d } = await api.post("/ats/score", { role_name: role });
      setData(d);
      if (d.error) setErr(d.error);
    } catch (ex) {
      setErr(ex.response?.data?.error || "Could not score resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ATS scoring"
        subtitle="Scores your latest uploaded resume and profile skills against a target role: keyword coverage, section completeness, projects, certifications, formatting, and skill alignment."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Target role</span>
                {roles.length > 0 ? (
                  <select className="input-saas" value={role} onChange={(e) => setRole(e.target.value)}>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input className="input-saas" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Analyst" />
                )}
              </label>
              <button type="button" onClick={score} disabled={loading} className="btn-primary shrink-0">
                {loading ? "Scoring…" : "Score resume"}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Upload a resume on the{" "}
              <Link to="/app/resume" className="font-medium text-brand-700 hover:underline">
                Resume
              </Link>{" "}
              page first for best results.
            </p>
            {err && !data?.ats_score ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
          </div>

          {data && !data.error && data.ats_score != null ? (
            <div className="glass overflow-hidden">
              <div className="grid gap-8 p-6 sm:grid-cols-[auto,1fr] sm:items-center sm:p-8">
                <ScoreRing score={data.ats_score} />
                <div>
                  <p className="font-display text-xl font-semibold text-slate-900">Resume fit — {data.role_name}</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{data.weights_note}</p>
                </div>
              </div>
              {data.missing_keywords?.length > 0 ? (
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
                  <p className="text-sm font-semibold text-slate-800">Keywords to weave in</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.missing_keywords.map((k) => (
                      <span key={k} className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {data.suggestions?.length > 0 ? (
                <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
                  <p className="text-sm font-semibold text-slate-800">Suggestions</p>
                  <ul className="mt-3 space-y-2">
                    {data.suggestions.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="glass p-5">
            <h3 className="font-display font-semibold text-slate-900">How it works</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
              <li>Parser reads your latest resume text.</li>
              <li>We compare against role keywords from the catalog.</li>
              <li>You get a score plus concrete improvement tips.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-b from-white to-brand-50/40 p-5">
            <p className="text-sm font-medium text-slate-800">Demo tip</p>
            <p className="mt-2 text-sm text-slate-600">
              For your viva, mention hybrid scoring on the Careers page and ATS weights shown on this screen.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
