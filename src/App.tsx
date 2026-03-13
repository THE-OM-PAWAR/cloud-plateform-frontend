import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage, Dashboard, TerminalPage, NotFound, CreateProject } from "@/pages";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/bash" element={<TerminalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
