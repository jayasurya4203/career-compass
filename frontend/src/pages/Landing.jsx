import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <span className="font-display font-semibold text-xl text-brand-800">Career Compass</span>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-slate-600 hover:text-brand-700">
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm rounded-full bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"
          >
            Sign up
          </Link>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-brand-700 font-medium mb-2">AI-powered career development</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Recommend careers, close skill gaps, and get placement-ready.
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Hybrid ML + rules engine, resume parsing, ATS scoring, roadmaps, courses, projects, and progress
            tracking—built for your college demo and viva.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-brand-600 text-white px-6 py-3 font-medium hover:bg-brand-700"
            >
              Start free
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-white">
              I have an account
            </Link>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">What you get</h2>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li>✓ Student profile + aptitude & interest assessment</li>
            <li>✓ Random Forest career prediction blended with skill & aptitude fit</li>
            <li>✓ Skill gap analysis & personalized learning roadmap</li>
            <li>✓ Resume upload (PDF/DOCX), parsing, ATS scoring</li>
            <li>✓ TF–IDF job-role matching, courses, projects, interview prep</li>
            <li>✓ Progress tracker + rule-based career chatbot</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
