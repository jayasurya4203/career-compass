import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Quiz from "./pages/Quiz.jsx";
import Resume from "./pages/Resume.jsx";
import Careers from "./pages/Careers.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import ATS from "./pages/ATS.jsx";
import JobMatch from "./pages/JobMatch.jsx";
import Learn from "./pages/Learn.jsx";
import Interview from "./pages/Interview.jsx";
import Progress from "./pages/Progress.jsx";
import Chat from "./pages/Chat.jsx";

function RequireAuth({ children }) {
  const { student, booting } = useAuth();
  if (booting) return null;
  if (!student) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="resume" element={<Resume />} />
        <Route path="careers" element={<Careers />} />
        <Route path="skill-gap" element={<SkillGap />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="ats" element={<ATS />} />
        <Route path="job-match" element={<JobMatch />} />
        <Route path="learn" element={<Learn />} />
        <Route path="interview" element={<Interview />} />
        <Route path="progress" element={<Progress />} />
        <Route path="chat" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
