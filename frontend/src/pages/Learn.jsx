import { useEffect, useState } from "react";
import api from "../api";

export default function Learn() {
  const [role, setRole] = useState(() => localStorage.getItem("cc_role") || "Data Analyst");
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);

  const load = async () => {
    const enc = encodeURIComponent(role);
    const [c, p] = await Promise.all([api.get(`/courses/${enc}`), api.get(`/projects/${enc}`)]);
    setCourses(c.data.courses || []);
    setProjects(p.data.projects || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Courses and projects</h1>
      <div className="flex gap-3 items-end flex-wrap">
        <label className="text-sm flex flex-col gap-1">
          Role
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 min-w-[240px]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>
        <button type="button" onClick={load} className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Load
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3">Recommended courses</h2>
          <ul className="space-y-3 text-sm">
            {courses.map((c) => (
              <li key={c.title} className="border-b border-slate-100 pb-2">
                <p className="font-medium">{c.title}</p>
                <p className="text-slate-600">
                  {c.platform} &middot; {c.difficulty} &middot; {c.duration} &middot; {c.free ? "Free" : "Paid"}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3">Portfolio projects</h2>
          <ul className="space-y-3 text-sm">
            {projects.map((p) => (
              <li key={p.title}>
                <p className="font-medium">{p.title}</p>
                <p className="text-slate-600">
                  {p.difficulty} &mdash; {p.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
