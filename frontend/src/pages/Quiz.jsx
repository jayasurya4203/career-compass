import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import api from "../api";
import PageHeader from "../components/PageHeader.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const TABS = [
  { id: "self", label: "Aptitude self-check", desc: "Rate how you show up across ten dimensions." },
  { id: "reasoning", label: "Reasoning quiz", desc: "Timed-style MCQ: logic, patterns, verbal puzzles." },
  { id: "technical", label: "Technical quiz", desc: "CS fundamentals: algorithms, DB, web, cloud." },
];

const dims = [
  { key: "logical", label: "Logical reasoning" },
  { key: "problem_solving", label: "Problem solving" },
  { key: "creativity", label: "Creativity" },
  { key: "communication", label: "Communication" },
  { key: "analytical", label: "Analytical thinking" },
  { key: "coding", label: "Coding comfort" },
  { key: "leadership", label: "Leadership" },
  { key: "teamwork", label: "Teamwork" },
  { key: "business", label: "Business understanding" },
  { key: "design", label: "Design interest" },
];

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ring-1 sm:min-w-[11rem] ${
        active
          ? "bg-gradient-to-br from-brand-600/15 to-accent-600/10 text-brand-900 dark:text-brand-100 ring-brand-300 dark:ring-brand-600/50 shadow-sm"
          : "bg-white/60 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 ring-slate-200/80 dark:ring-slate-600 hover:ring-brand-200 dark:hover:ring-brand-500/40"
      }`}
    >
      {children}
    </button>
  );
}

export default function Quiz() {
  const { theme } = useTheme();
  const [tab, setTab] = useState("self");
  const [scores, setScores] = useState(Object.fromEntries(dims.map((d) => [d.key, 70])));
  const [selfResult, setSelfResult] = useState(null);
  const [summary, setSummary] = useState(null);

  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqResult, setMcqResult] = useState(null);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqErr, setMcqErr] = useState("");

  const chartStroke = theme === "dark" ? "#a5b4fc" : "#6366f1";
  const chartFill = theme === "dark" ? "rgba(165, 180, 252, 0.35)" : "rgba(99, 102, 241, 0.35)";
  const tickFill = theme === "dark" ? "#94a3b8" : "#64748b";

  const loadSummary = useCallback(async () => {
    try {
      const { data } = await api.get("/quiz/summary");
      setSummary(data);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const fetchMcq = useCallback((qt) => {
    setMcqResult(null);
    setMcqErr("");
    setMcqAnswers({});
    setMcqLoading(true);
    api
      .get(`/quiz/mcq/${qt}`)
      .then(({ data }) => {
        setMcqQuestions(data.questions || []);
      })
      .catch(() => {
        setMcqQuestions([]);
        setMcqErr("Could not load questions.");
      })
      .finally(() => setMcqLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "reasoning" || tab === "technical") fetchMcq(tab);
  }, [tab, fetchMcq]);

  const submitSelf = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/aptitude/submit", scores);
    setSelfResult(data);
    loadSummary();
  };

  const submitMcq = async () => {
    setMcqErr("");
    const qt = tab === "technical" ? "technical" : "reasoning";
    try {
      const { data } = await api.post(`/quiz/mcq/${qt}/submit`, { answers: mcqAnswers });
      setMcqResult(data);
      loadSummary();
    } catch (ex) {
      setMcqErr(ex.response?.data?.error || "Submit failed. Answer every question.");
    }
  };

  const radarData = useMemo(() => {
    if (!selfResult?.domain_scores) return [];
    return Object.entries(selfResult.domain_scores).map(([subject, A]) => ({ subject, A, fullMark: 100 }));
  }, [selfResult]);

  const mcqComplete =
    mcqQuestions.length > 0 && mcqQuestions.every((q) => mcqAnswers[q.id] !== undefined && mcqAnswers[q.id] !== "");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assessments"
        subtitle="Calibrate your profile with a self-reported aptitude map, then validate with reasoning and technical multiple-choice quizzes. Results feed career recommendations when you run prediction."
      />

      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="glass rounded-2xl p-4 border border-slate-100/80 dark:border-slate-700/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Latest aptitude</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand-700 dark:text-brand-300">
              {summary.aptitude?.overall ?? "—"}
            </p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              {summary.aptitude ? "Self-check saved" : "Not submitted yet"}
            </p>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-100/80 dark:border-slate-700/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reasoning MCQ</p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
              {summary.reasoning ? `${summary.reasoning.score_pct}%` : "—"}
            </p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              {summary.reasoning ? `${summary.reasoning.correct}/${summary.reasoning.total} correct` : "Take the quiz"}
            </p>
          </div>
          <div className="glass rounded-2xl p-4 border border-slate-100/80 dark:border-slate-700/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Technical MCQ</p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
              {summary.technical ? `${summary.technical.score_pct}%` : "—"}
            </p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              {summary.technical ? `${summary.technical.correct}/${summary.technical.total} correct` : "Take the quiz"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {TABS.map((t) => (
          <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            <span className="font-display block">{t.label}</span>
            <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">{t.desc}</span>
          </TabButton>
        ))}
      </div>

      {tab === "self" && (
        <>
          <form onSubmit={submitSelf} className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-100/80 dark:border-slate-700/80">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Slide each dimension from 40–100. Be honest — this snapshot pairs with quizzes and your profile for hybrid career scoring.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {dims.map((d) => (
                <label key={d.key} className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{d.label}</span>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={scores[d.key]}
                    onChange={(e) => setScores({ ...scores, [d.key]: Number(e.target.value) })}
                    className="accent-brand-600 dark:accent-brand-400"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{scores[d.key]}</span>
                </label>
              ))}
            </div>
            <button type="submit" className="btn-primary">
              Save aptitude snapshot
            </button>
          </form>

          {selfResult && (
            <div className="glass rounded-2xl p-6 sm:p-8 grid md:grid-cols-2 gap-8 border border-slate-100/80 dark:border-slate-700/80">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">Overall</h2>
                <p className="text-4xl font-display font-bold text-brand-700 dark:text-brand-300 mt-2">{selfResult.overall}</p>
                <h3 className="font-medium mt-6 mb-2 text-slate-800 dark:text-slate-200">Domain blend</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  {Object.entries(selfResult.domain_scores || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: <strong>{v}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-72 min-h-[16rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill, fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: tickFill, fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke={chartStroke} fill={chartFill} fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {(tab === "reasoning" || tab === "technical") && (
        <div className="space-y-6">
          {mcqLoading ? (
            <div className="glass rounded-2xl p-12 text-center text-slate-600 dark:text-slate-400">Loading questions…</div>
          ) : (
            <div className="space-y-4">
              {mcqQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="glass rounded-2xl p-5 sm:p-6 border border-slate-100/80 dark:border-slate-700/80"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200/80 dark:ring-slate-600">
                      Q{idx + 1}
                    </span>
                    {q.category ? (
                      <span className="badge bg-brand-50 dark:bg-brand-950/80 text-brand-800 dark:text-brand-200 ring-1 ring-brand-100 dark:ring-brand-800">
                        {q.category}
                      </span>
                    ) : (
                      <span className="badge bg-violet-50 dark:bg-violet-950/50 text-violet-800 dark:text-violet-200 ring-1 ring-violet-100 dark:ring-violet-900">
                        Reasoning
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">{q.prompt}</p>
                  <div className="mt-4 grid gap-2">
                    {q.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                          mcqAnswers[q.id] === i
                            ? "border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 dark:border-brand-500"
                            : "border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          className="accent-brand-600"
                          name={q.id}
                          checked={mcqAnswers[q.id] === i}
                          onChange={() => setMcqAnswers({ ...mcqAnswers, [q.id]: i })}
                        />
                        <span className="text-slate-800 dark:text-slate-200">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mcqErr ? <p className="text-sm text-red-600 dark:text-red-400">{mcqErr}</p> : null}

          {mcqQuestions.length > 0 && !mcqLoading ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={!mcqComplete} onClick={submitMcq} className="btn-primary disabled:opacity-50">
                Submit answers
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fetchMcq(tab === "technical" ? "technical" : "reasoning")}
              >
                New question set
              </button>
            </div>
          ) : null}

          {mcqResult && (
            <div className="glass rounded-2xl p-6 border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">Score</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-400">{mcqResult.score_pct}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {mcqResult.correct} of {mcqResult.total} correct
              </p>
              {mcqResult.details?.length ? (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-brand-700 dark:text-brand-300 font-medium">Review answers</summary>
                  <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                    {mcqResult.details.map((d) => (
                      <li key={d.id} className="rounded-lg bg-white/60 dark:bg-slate-900/50 p-3">
                        <span className={d.correct ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                          {d.correct ? "✓" : "✗"}
                        </span>{" "}
                        {d.prompt}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
