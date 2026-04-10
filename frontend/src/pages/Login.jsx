import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/app");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Invalid email or password.");
    }
  };

  return (
    <div className="page-gradient min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
      <form onSubmit={submit} className="w-full max-w-md glass rounded-2xl p-8 sm:p-10 space-y-5 shadow-card-hover dark:shadow-card-dark">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">Welcome back</h1>
        {err && <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input className="input-saas" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <input className="input-saas" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Login
        </button>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          New here?{" "}
          <Link className="font-semibold text-brand-700 dark:text-brand-400 hover:text-accent-700" to="/register">
            Create an account
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
}
