import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

const ROLE_KEY = "cc_role";

export default function Interview() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "Data Analyst");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topicDone, setTopicDone] = useState({});
  const [openDrill, setOpenDrill] = useState(null);
  const [showHint, setShowHint] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    localStorage.setItem(ROLE_KEY, role);
    try {
      const enc = encodeURIComponent(role);
      const { data: d } = await api.get(`/interview/${enc}`);
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [role]);

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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setTopicDone({});
    setOpenDrill(null);
    setShowHint({});
  }, [role]);

  const topics = data?.topics || [];
  const drills = data?.drills || [];
  const tips = data?.tips || [];

  const topicProgress = useMemo(() => {
    if (!topics.length) return 0;
    const n = topics.filter((t) => topicDone[t]).length;
    return Math.round((n / topics.length) * 100);
  }, [topics, topicDone]);

  const toggleTopic = (t) => {
    setTopicDone((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interview preparation"
        subtitle="Role-specific topic checklist, timed-style drills with model hints, and universal framing tips — built for placement and internship panels."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end max-w-2xl">
        <div className="flex-1 text-sm min-w-0">
          <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">Target role</span>
          <div className="flex gap-2 flex-wrap">
            {roles.length > 0 ? (
              <select className="input-saas flex-1 min-w-[12rem]" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <input className="input-saas flex-1 min-w-[12rem]" value={role} onChange={(e) => setRole(e.target.value)} />
            )}
            <button type="button" onClick={load} disabled={loading} className="btn-primary shrink-0">
              {loading ? "…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-100/80 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">Technical & HR topics</h2>
              <span className="badge bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-200 ring-1 ring-brand-200/80 dark:ring-brand-800">
                {topicProgress}% reviewed
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Check off topics as you cover them — mirrors common interview blueprints for this role.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {topics.map((t) => (
                <li key={t}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 dark:border-slate-600 bg-white/50 dark:bg-slate-800/40 px-3 py-2.5 transition hover:border-brand-200 dark:hover:border-brand-600/50">
                    <input
                      type="checkbox"
                      className="mt-1 accent-brand-600"
                      checked={!!topicDone[t]}
                      onChange={() => toggleTopic(t)}
                    />
                    <span className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{t}</span>
                  </label>
                </li>
              ))}
            </ul>
            {!topics.length && !loading ? (
              <p className="mt-4 text-sm text-slate-500">No topics for this role name — pick from the dropdown.</p>
            ) : null}
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-100/80 dark:border-slate-700/80">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">Drill cards</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Practice aloud. Reveal the hint only after you attempt a 60–90s answer.
            </p>
            <div className="mt-5 space-y-3">
              {drills.map((d, i) => {
                const id = `${i}-${d.question?.slice(0, 24)}`;
                const expanded = openDrill === id;
                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900/60 dark:to-slate-800/40 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDrill(expanded ? null : id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.question}</span>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{expanded ? "−" : "+"}</span>
                    </button>
                    {expanded ? (
                      <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {d.type ? (
                            <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-600">
                              {d.type}
                            </span>
                          ) : null}
                          {d.difficulty ? (
                            <span className="badge bg-violet-50 dark:bg-violet-950/50 text-violet-800 dark:text-violet-200 ring-1 ring-violet-100 dark:ring-violet-900">
                              {d.difficulty}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline"
                          onClick={() => setShowHint((prev) => ({ ...prev, [id]: !prev[id] }))}
                        >
                          {showHint[id] ? "Hide coaching hint" : "Reveal coaching hint"}
                        </button>
                        {showHint[id] ? (
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed rounded-xl bg-brand-50/60 dark:bg-slate-900/80 p-4 border border-brand-100/80 dark:border-slate-600">
                            {d.hint}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {!drills.length && !loading ? (
              <p className="mt-4 text-sm text-slate-500">No drills loaded.</p>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-slate-100/80 dark:border-slate-700/80">
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Universal tips</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 p-5 text-white shadow-lg shadow-brand-500/25">
            <p className="font-display font-semibold">Mock flow</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-white/90">
              <li>Warm intro (60s)</li>
              <li>Two behavioral STAR stories</li>
              <li>Role technical depth from topics</li>
              <li>Your questions for the panel</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
