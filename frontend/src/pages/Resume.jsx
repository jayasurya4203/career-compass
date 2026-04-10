import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/PageHeader.jsx";

function Field({ label, value }) {
  const text = value == null || value === "" ? "—" : String(value);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap break-words">{text}</p>
    </div>
  );
}

export default function Resume() {
  const { student } = useAuth();
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!student?.id) return;
    try {
      const { data } = await api.get(`/resume/parsed/${student.id}`);
      if (data.resume) {
        setParsed({
          extracted_name: data.resume.extracted_name,
          extracted_email: data.resume.extracted_email,
          extracted_phone: data.resume.extracted_phone,
          extracted_skills: data.resume.extracted_skills,
          extracted_projects: data.resume.extracted_projects,
          extracted_education: data.resume.extracted_education,
          extracted_links: data.resume.extracted_links,
          ats_score: data.resume.ats_score,
        });
      }
    } catch {
      /* no saved resume */
    }
  }, [student?.id]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setErr("");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParsed(data.parsed);
      await loadSaved();
    } catch (ex) {
      setErr(ex.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && /\.(pdf|docx)$/i.test(f.name)) setFile(f);
    else setErr("Please drop a PDF or DOCX file.");
  };

  return (
    <div>
      <PageHeader
        title="Resume"
        subtitle="Upload a PDF or DOCX. We extract contact details, skills, education, and projects so you can tune your profile and run ATS scoring against a target role."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={upload} className="glass p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-slate-900">Upload file</h2>
            <p className="mt-1 text-sm text-slate-600">Max quality parsing with clear section headings (Education, Skills, Projects).</p>

            <div
              className={`mt-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                drag ? "border-brand-400 bg-brand-50/50" : "border-slate-200 bg-white/50 hover:border-brand-200"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("resume-file")?.click()}
            >
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setErr("");
                }}
              />
              <p className="text-sm font-medium text-slate-800">Drop your resume here or click to browse</p>
              <p className="mt-1 text-xs text-slate-500">PDF or DOCX</p>
              {file ? <p className="mt-4 text-sm text-brand-700 font-medium">{file.name}</p> : null}
            </div>

            {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" disabled={!file || loading} className="btn-primary disabled:opacity-50 disabled:pointer-events-none">
                {loading ? "Parsing…" : "Upload & parse"}
              </button>
              <Link to="/app/ats" className="btn-secondary">
                Go to ATS scoring
              </Link>
            </div>
          </form>

          {parsed ? (
            <div className="glass p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-slate-900">Extracted snapshot</h2>
                {parsed.ats_score != null ? (
                  <span className="badge bg-brand-100 text-brand-800">Last ATS: {parsed.ats_score}/100</span>
                ) : null}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={parsed.extracted_name} />
                <Field label="Email" value={parsed.extracted_email} />
                <Field label="Phone" value={parsed.extracted_phone} />
                <Field label="Links" value={parsed.extracted_links} />
                <Field label="Skills" value={parsed.extracted_skills} />
                <Field label="Education" value={parsed.extracted_education} />
                <Field label="Projects" value={parsed.extracted_projects} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 px-6 py-10 text-center text-sm text-slate-500">
              No parsed resume yet. Upload a file to see extracted fields here.
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass p-5">
            <h3 className="font-display font-semibold text-slate-900">Tips for students</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Use bullet points with metrics (%, time saved, users).</li>
              <li>Mirror keywords from your target role in a natural way.</li>
              <li>Keep one column, standard fonts — better for ATS parsers.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-600/90 to-accent-600/90 p-5 text-white shadow-lg shadow-brand-500/20">
            <p className="font-display font-semibold">Next step</p>
            <p className="mt-2 text-sm text-white/90">
              After upload, run ATS scoring with your goal role to see keyword gaps and suggestions.
            </p>
            <Link
              to="/app/ats"
              className="mt-4 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              Open ATS module →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
