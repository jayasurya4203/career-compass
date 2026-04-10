import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";

const cards = [
  { to: "/app/profile", title: "Profile", desc: "Branch, CGPA, skills, projects, internships", accent: "from-brand-500/15 to-accent-500/10" },
  { to: "/app/quiz", title: "Assessments", desc: "Aptitude, reasoning MCQ, technical MCQ", accent: "from-violet-500/15 to-brand-500/10" },
  { to: "/app/careers", title: "Careers", desc: "Hybrid ML + skills + aptitude recommendations", accent: "from-sky-500/15 to-brand-500/10" },
  { to: "/app/skill-gap", title: "Skill gap", desc: "Readiness vs a target role", accent: "from-accent-500/15 to-violet-500/10" },
  { to: "/app/roadmap", title: "Roadmap", desc: "Weekly milestones toward your role", accent: "from-brand-500/15 to-sky-500/10" },
  { to: "/app/resume", title: "Resume", desc: "Upload PDF/DOCX and view parsed fields", accent: "from-indigo-500/15 to-accent-500/10" },
  { to: "/app/ats", title: "ATS score", desc: "Keyword and section fit for recruiters", accent: "from-rose-500/12 to-brand-500/10" },
  { to: "/app/job-match", title: "Job match", desc: "TF–IDF similarity to role descriptions", accent: "from-teal-500/15 to-brand-500/10" },
  { to: "/app/learn", title: "Learn", desc: "Courses, links, and projects by role", accent: "from-amber-500/12 to-violet-500/10" },
  { to: "/app/interview", title: "Interview prep", desc: "Topic checklist for your role", accent: "from-brand-500/15 to-rose-500/10" },
  { to: "/app/progress", title: "Progress", desc: "Track skills, courses, and readiness", accent: "from-cyan-500/12 to-brand-500/10" },
  { to: "/app/chat", title: "Counselor", desc: "Quick answers on careers and resumes", accent: "from-accent-500/15 to-indigo-500/10" },
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
    <div>
      <PageHeader
        title={`Hello, ${student?.name || "there"}`}
        subtitle="Follow the path: profile → assessments → careers → gaps & roadmap → resume & ATS → learn & interview → progress."
      />

      {trends.length > 0 ? (
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trends.map((t) => (
            <div
              key={t.title}
              className="card-interactive rounded-2xl border border-slate-100/80 dark:border-slate-700/80 bg-gradient-to-br from-white to-brand-50/30 dark:from-slate-900/80 dark:to-brand-950/20 p-5"
            >
              <p className="font-display font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">{t.demand}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.note}</p>
            </div>
          ))}
        </section>
      ) : null}

      <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Your toolkit</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group card-interactive relative overflow-hidden rounded-2xl border border-slate-100/80 dark:border-slate-700/80 bg-gradient-to-br ${c.accent} dark:opacity-95 p-6`}
          >
            <span className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 transition group-hover:text-brand-400" aria-hidden>
              →
            </span>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100 pr-8">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
