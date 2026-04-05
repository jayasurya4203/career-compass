import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Progress() {
  const { student } = useAuth();
  const [form, setForm] = useState({
    completed_skills: "",
    completed_courses: "",
    completed_projects: "",
    readiness_score: "",
  });
  const [saved, setSaved] = useState("");

  const load = async () => {
    if (!student?.id) return;
    const { data } = await api.get(`/progress/${student.id}`);
    const p = data.progress || {};
    setForm({
      completed_skills: p.completed_skills || "",
      completed_courses: p.completed_courses || "",
      completed_projects: p.completed_projects || "",
      readiness_score: p.readiness_score ?? "",
    });
  };

  useEffect(() => {
    load();
  }, [student?.id]);

  const save = async (e) => {
    e.preventDefault();
    await api.post("/progress/update", {
      ...form,
      readiness_score: form.readiness_score === "" ? null : Number(form.readiness_score),
    });
    setSaved("Saved");
    setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Progress tracker</h1>
      <form onSubmit={save} className="glass rounded-xl p-6 space-y-4 text-sm max-w-xl">
        {[
          ["completed_skills", "Completed skills (comma-separated)"],
          ["completed_courses", "Completed courses"],
          ["completed_projects", "Completed projects"],
        ].map(([k, label]) => (
          <label key={k} className="flex flex-col gap-1">
            <span className="text-slate-600">{label}</span>
            <textarea
              className="rounded-lg border border-slate-200 px-3 py-2 min-h-[70px]"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">Career readiness score (0–100)</span>
          <input
            type="number"
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.readiness_score}
            onChange={(e) => setForm({ ...form, readiness_score: e.target.value })}
          />
        </label>
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Save progress
        </button>
        {saved && <span className="text-green-700">{saved}</span>}
      </form>
    </div>
  );
}
