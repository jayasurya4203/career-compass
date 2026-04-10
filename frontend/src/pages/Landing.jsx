import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Landing() {
  return (
    <div className="page-gradient">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text font-display text-xl font-bold text-transparent dark:from-brand-400 dark:to-accent-400">
          Career Compass
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-white/60 dark:hover:bg-slate-800/80 hover:text-brand-700 dark:hover:text-brand-300"
          >
            Login
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Sign up
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-2 lg:pt-12">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-white/80 dark:bg-slate-800/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300 shadow-sm ring-1 ring-brand-100 dark:ring-slate-600">
            Student · placement · demo-ready
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Plan your career with clarity.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Hybrid recommendations, resume parsing, ATS scoring, curated courses with real links, roadmaps, and progress — in one calm workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3">
              Start free
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3">
              I have an account
            </Link>
          </div>
        </div>

        <div className="glass relative overflow-hidden p-8 shadow-card-hover dark:shadow-card-dark">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-400/25 to-accent-400/20 blur-2xl dark:opacity-60" />
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">What you get</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span> Profile + assessments (aptitude, reasoning, technical)
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span> ML-blended career suggestions
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span> Skill gap, roadmap, resume & ATS
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span> Learn tab with curated links
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600 dark:text-brand-400">✓</span> Interview drills & progress tracker
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
