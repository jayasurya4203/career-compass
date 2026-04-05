import { useState } from "react";
import api from "../api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask about careers, skills, resumes, or roadmaps." },
  ]);
  const [input, setInput] = useState("");

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    const { data } = await api.post("/chatbot", { message: userMsg });
    setMessages((m) => [...m, { role: "bot", text: data.reply }]);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">AI career counselor (rule-based)</h1>
      <div className="glass rounded-xl p-4 h-96 overflow-y-auto space-y-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 max-w-[85%] ${
              m.role === "user" ? "bg-brand-600 text-white ml-auto" : "bg-slate-100 text-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What skills for data analyst?"
        />
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
          Send
        </button>
      </form>
    </div>
  );
}
