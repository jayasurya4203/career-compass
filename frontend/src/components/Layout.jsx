import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const nav = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/quiz", label: "Assessments" },
  { to: "/app/resume", label: "Resume" },
  { to: "/app/careers", label: "Careers" },
  { to: "/app/skill-gap", label: "Skill gap" },
  { to: "/app/roadmap", label: "Roadmap" },
  { to: "/app/ats", label: "ATS score" },
  { to: "/app/job-match", label: "Job match" },
  { to: "/app/learn", label: "Learn" },
  { to: "/app/interview", label: "Interview prep" },
  { to: "/app/progress", label: "Progress" },
  { to: "/app/chat", label: "Counselor" },
];

function pageTitle(pathname) {
  const sorted = [...nav].sort((a, b) => b.to.length - a.to.length);
  const hit = sorted.find((n) =>
    n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(`${n.to}/`)
  );
  return hit?.label ?? "Dashboard";
}

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Layout() {
  const { student, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef(null);

  const title = useMemo(() => pageTitle(pathname), [pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-brand-600/10 to-accent-600/10 text-brand-800 dark:text-brand-200 shadow-sm ring-1 ring-brand-200/60 dark:ring-brand-500/40"
        : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 flex h-screen w-[min(17.5rem,88vw)] flex-col border-r border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/95 shadow-nav backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 px-4">
          <Link
            to="/app"
            className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-transparent"
          >
            Career Compass
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary w-full justify-center gap-2 text-slate-600 dark:text-slate-300"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="btn-secondary w-full text-slate-600 dark:text-slate-300"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-300 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</p>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Stay consistent — small steps every week.</p>
            </div>
          </div>

          <div ref={userMenuRef} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-brand-200 dark:hover:border-brand-500/50"
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
            </button>
            <div className="hidden sm:block text-right">
              <p className="truncate max-w-[10rem] text-sm font-medium text-slate-800 dark:text-slate-200">{student?.name}</p>
              <p className="truncate max-w-[10rem] text-xs text-slate-500 dark:text-slate-400">{student?.email}</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-800 py-1.5 pl-1.5 pr-2 shadow-sm transition hover:border-brand-200 dark:hover:border-brand-500/50"
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
              aria-haspopup="true"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                {(student?.name || "?").slice(0, 1).toUpperCase()}
              </span>
              <IconChevron className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition ${userOpen ? "rotate-180" : ""}`} />
            </button>

            {userOpen ? (
              <div
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white dark:bg-slate-900 py-1 shadow-card-hover dark:shadow-card-dark"
                role="menu"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 sm:hidden">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{student?.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{student?.email}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800 sm:hidden"
                  onClick={() => {
                    setUserOpen(false);
                    toggleTheme();
                  }}
                >
                  {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <Link
                  to="/app/profile"
                  className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800"
                  role="menuitem"
                  onClick={() => setUserOpen(false)}
                >
                  Edit profile
                </Link>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
