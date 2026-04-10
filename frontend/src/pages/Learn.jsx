import { useCallback, useEffect, useState } from "react";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

const roleStorageKey = "cc_role";

const typeStyles = {
  youtube: "bg-red-50 text-red-800 ring-red-100",
  linkedin: "bg-sky-50 text-sky-800 ring-sky-100",
  docs: "bg-slate-100 text-slate-700 ring-slate-200",
  article: "bg-amber-50 text-amber-900 ring-amber-100",
  course: "bg-violet-50 text-violet-800 ring-violet-100",
};

function courseHref(c) {
  if (c.url) return c.url;
  const q = encodeURIComponent(`${c.title} ${c.platform} tutorial`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

function ResourceIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Learn() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(() => localStorage.getItem(roleStorageKey) || "Data Analyst");
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [webResources, setWebResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    localStorage.setItem(roleStorageKey, role);
    const enc = encodeURIComponent(role);
    try {
      const [c, p] = await Promise.all([api.get(`/courses/${enc}`), api.get(`/projects/${enc}`)]);
      setCourses(c.data.courses || []);
      setProjects(p.data.projects || []);
      setWebResources(c.data.web_resources || []);
    } catch {
      setCourses([]);
      setProjects([]);
      setWebResources([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/roles");
        setRoles(data.roles || []);
      } catch {
        setRoles([]);
      }
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Learn"
        subtitle="Curated courses with direct links (official docs, YouTube, LinkedIn Learning topics, and more) plus portfolio project ideas for your selected role."
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm max-w-md">
          <span className="mb-1.5 block font-medium text-slate-700">Role</span>
          {roles.length > 0 ? (
            <select className="input-saas" value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <input className="input-saas" value={role} onChange={(e) => setRole(e.target.value)} />
          )}
        </label>
        <button type="button" onClick={load} disabled={loading} className="btn-primary">
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-slate-900">Courses & learning paths</h2>
          <p className="mt-1 text-sm text-slate-600">Open in a new tab — mix free and optional paid paths.</p>
          <ul className="mt-6 space-y-4">
            {courses.map((c) => (
              <li
                key={c.title}
                className="card-interactive rounded-xl border border-slate-100/80 bg-white/60 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {c.platform} · {c.difficulty} · {c.duration} · {c.free ? "Free" : "Paid"}
                    </p>
                  </div>
                  <a
                    href={courseHref(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shrink-0 py-2 text-xs sm:text-sm"
                  >
                    Open resource
                  </a>
                </div>
              </li>
            ))}
          </ul>
          {courses.length === 0 && !loading ? (
            <p className="mt-6 text-sm text-slate-500">No courses for this role name — pick a role from the list or check spelling.</p>
          ) : null}
        </section>

        <section className="space-y-6">
          <div className="glass p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-slate-900">Portfolio projects</h2>
            <ul className="mt-4 space-y-4">
              {projects.map((p) => (
                <li key={p.title} className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 transition hover:border-brand-200/60">
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-brand-700">{p.difficulty}</span> — {p.description}
                  </p>
                </li>
              ))}
            </ul>
            {projects.length === 0 && !loading ? (
              <p className="mt-4 text-sm text-slate-500">No projects listed for this role.</p>
            ) : null}
          </div>

          <div className="glass p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-slate-900">Web picks</h2>
            <p className="mt-1 text-sm text-slate-600">YouTube channels, LinkedIn Learning topic hubs, docs, and articles.</p>
            <ul className="mt-4 space-y-3">
              {webResources.map((w) => (
                <li key={w.url}>
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 transition hover:border-brand-200 hover:shadow-card"
                  >
                    <span className="mt-0.5 text-brand-600 group-hover:text-accent-600">
                      <ResourceIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900 group-hover:text-brand-800">{w.title}</span>
                        {w.type ? (
                          <span className={`badge ring-1 ${typeStyles[w.type] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                            {w.type}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{w.url}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {webResources.length === 0 && !loading ? (
              <p className="mt-4 text-sm text-slate-500">No extra links for this role in the catalog.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
