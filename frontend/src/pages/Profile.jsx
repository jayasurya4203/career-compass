import { useEffect, useState } from "react";
import api from "../api";

const empty = {
  name: "",
  branch: "",
  degree: "B.Tech",
  year: "",
  cgpa: "",
  interests: "",
  skills: "",
  preferred_subjects: "",
  projects_done: "",
  certifications: "",
  internship_experience: "No",
  communication_score: 70,
  work_style: "Analytical",
  career_goal: "",
};

export default function Profile() {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/profile");
        const p = data.profile || {};
        setForm({ ...empty, ...p, cgpa: p.cgpa ?? "", communication_score: p.communication_score ?? 70 });
      } catch {
        setMsg("Could not load profile.");
      }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        ...form,
        cgpa: form.cgpa === "" ? null : Number(form.cgpa),
        communication_score: Number(form.communication_score),
      };
      await api.post("/profile", payload);
      setMsg("Saved.");
    } catch {
      setMsg("Save failed.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile builder</h1>
      <form onSubmit={save} className="glass rounded-xl p-6 grid md:grid-cols-2 gap-4 text-sm">
        {[
          ["name", "Full name"],
          ["branch", "Branch"],
          ["degree", "Degree"],
          ["year", "Year"],
          ["cgpa", "CGPA"],
          ["interests", "Interests (comma-separated)"],
          ["skills", "Skills (comma-separated)"],
          ["preferred_subjects", "Preferred subjects"],
          ["projects_done", "Projects (comma-separated or descriptions)"],
          ["certifications", "Certifications"],
          ["career_goal", "Career goal (optional)"],
        ].map(([k, label]) => (
          <label key={k} className="flex flex-col gap-1 md:col-span-1">
            <span className="text-slate-600">{label}</span>
            <input
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">Internship experience</span>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.internship_experience}
            onChange={(e) => setForm({ ...form, internship_experience: e.target.value })}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">Communication self-rating (0–100)</span>
          <input
            type="number"
            min={0}
            max={100}
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.communication_score}
            onChange={(e) => setForm({ ...form, communication_score: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-slate-600">Preferred work style</span>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 max-w-md"
            value={form.work_style}
            onChange={(e) => setForm({ ...form, work_style: e.target.value })}
          >
            {["Creative", "Analytical", "Coding", "Management"].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
            Save profile
          </button>
          {msg && <span className="text-sm text-slate-600">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
