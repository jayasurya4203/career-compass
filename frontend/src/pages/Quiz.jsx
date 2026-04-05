import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import api from "../api";

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

export default function Quiz() {
  const [scores, setScores] = useState(Object.fromEntries(dims.map((d) => [d.key, 70])));
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/aptitude/submit", scores);
    setResult(data);
  };

  const radarData = result
    ? Object.entries(result.domain_scores).map(([subject, A]) => ({ subject, A, fullMark: 100 }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Aptitude & interest assessment</h1>
        <p className="text-slate-600 text-sm mt-1">Slide each dimension from 40–100 (demo-friendly).</p>
      </div>
      <form onSubmit={submit} className="glass rounded-xl p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {dims.map((d) => (
            <label key={d.key} className="flex flex-col gap-1 text-sm">
              <span className="text-slate-700">{d.label}</span>
              <input
                type="range"
                min={40}
                max={100}
                value={scores[d.key]}
                onChange={(e) => setScores({ ...scores, [d.key]: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-500">{scores[d.key]}</span>
            </label>
          ))}
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Submit assessment
        </button>
      </form>
      {result && (
        <div className="glass rounded-xl p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Overall aptitude</h2>
            <p className="text-4xl font-display font-bold text-brand-700">{result.overall}</p>
            <h3 className="font-medium mt-4 mb-2">Domain scores</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              {Object.entries(result.domain_scores).map(([k, v]) => (
                <li key={k}>
                  {k}: <strong>{v}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
