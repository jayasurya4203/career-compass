import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/quiz", label: "Aptitude Test" },
  { to: "/app/resume", label: "Resume" },
  { to: "/app/careers", label: "Careers" },
  { to: "/app/skill-gap", label: "Skill Gap" },
  { to: "/app/roadmap", label: "Roadmap" },
  { to: "/app/ats", label: "ATS Score" },
  { to: "/app/job-match", label: "Job Match" },
  { to: "/app/learn", label: "Courses & Projects" },
  { to: "/app/interview", label: "Interview Prep" },
  { to: "/app/progress", label: "Progress" },
  { to: "/app/chat", label: "AI Counselor" },
];

export default function Layout() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="p-4 flex md:flex-col gap-3 md:gap-6 items-center md:items-stretch justify-between">
          <Link to="/" className="font-display text-lg font-semibold text-brand-700">
            Career Compass
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-xs text-slate-500 truncate max-w-[10rem]" title={student?.email}>
              {student?.name}
            </div>
            <button
              type="button"
              className="md:hidden text-xs rounded border border-slate-200 px-2 py-1 text-slate-600"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Out
            </button>
          </div>
        </div>
        <nav className="px-2 pb-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 ${
                  isActive ? "bg-brand-50 text-brand-800 font-medium" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 hidden md:block">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
