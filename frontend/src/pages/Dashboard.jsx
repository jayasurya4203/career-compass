import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api";

const cards = [
  { to: "/app/profile", title: "Profile builder", desc: "Branch, CGPA, skills, projects, internships" },
  { to: "/app/quiz", title: "Aptitude & interest", desc: "10 dimensions → domain radar chart" },
  { to: "/app/careers", title: "Career prediction", desc: "Hybrid ML + skill/aptitude blend" },
  { to: "/app/skill-gap", title: "Skill gap analysis", desc: "Readiness % vs target role" },
  { to: "/app/roadmap", title: "Learning roadmap", desc: "Weekly milestones" },
  { to: "/app/resume", title: "Resume upload", desc: "PDF/DOCX parsing" },
  { to: "/app/ats", title: "ATS scoring", desc: "Keyword & section coverage" },
  { to: "/app/job-match", title: "Job role matching", desc: "TF–IDF cosine similarity" },
  { to: "/app/learn", title: "Courses & projects", desc: "Curated per role" },
  { to: "/app/interview", title: "Interview prep", desc: "Role-based topics" },
  { to: "/app/progress", title: "Progress tracker", desc: "Readiness over time" },
  { to: "/app/chat", title: "Career chatbot", desc: "Rule-based counselor" },
];

export default function Dashboard() {
  const { student } = useAuth();
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/trends");
        setTrends(data.trends || []);
      } catch {
        setTrends([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Hello, {student?.name}</h1>
        <p className="text-slate-600 mt-2">
          Work through the flow: profile → quiz → careers → gaps → roadmap → resume/ATS → learn → interview →
          progress.
        </p>
      </div>
      {trends.length > 0 && (
        <section className="glass rounded-xl p-5">
          <h2 className="font-display font-semibold text-lg mb-3">Career trends (2026 snapshot)</h2>
          <ul className="text-sm text-slate-700 space-y-2">
            {trends.map((t) => (
              <li key={t.title}>
                <strong>{t.title}</strong> <span className="text-brand-600">{t.demand}</span> — {t.note}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="glass rounded-xl p-5 hover:border-brand-200 transition border border-transparent"
          >
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
