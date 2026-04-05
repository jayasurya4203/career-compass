import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password });
      nav("/app");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Could not register.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-md glass rounded-2xl p-8 space-y-4">
        <h1 className="font-display text-2xl font-semibold">Create your account</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Name</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Email</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Password</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand-600 text-white py-2 font-medium hover:bg-brand-700">
          Sign up
        </button>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="text-brand-700" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
