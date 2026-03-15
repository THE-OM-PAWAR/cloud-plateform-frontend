import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { 
  LandingPage, 
  Dashboard, 
  TerminalPage, 
  NotFound, 
  CreateProject,
  AppsMarketplace,
  AdminApps,
  MyDeployments
} from "@/pages";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import ProjectDetail from "@/pages/ProjectDetail";
import Integrations from "@/pages/Integrations";
import DeployFromGitHub from "@/pages/DeployFromGitHub";
import Projects from "@/pages/Projects";
import CodeReviewer from "@/pages/CodeReviewer";
import ReviewWorkspace from "@/pages/ReviewWorkspace";
import CliAuth from "@/pages/CliAuth";
import CliDocumentation from "@/pages/CliDocumentation";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="CloudOne-theme">
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/cli-auth" element={<CliAuth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/deploy" 
              element={
                <ProtectedRoute>
                  <DeployFromGitHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/reviewer" 
              element={
                <ProtectedRoute>
                  <CodeReviewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/reviewer/:owner/:repo" 
              element={
                <ProtectedRoute>
                  <ReviewWorkspace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/integrations" 
              element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/cli" 
              element={
                <ProtectedRoute>
                  <CliDocumentation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-project" 
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/apps" 
              element={
                <ProtectedRoute>
                  <AppsMarketplace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/apps/deployments" 
              element={
                <ProtectedRoute>
                  <MyDeployments />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/project/:type/:name"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/apps" 
              element={
                <ProtectedRoute>
                  <AdminApps />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bash" 
              element={
                <ProtectedRoute>
                  <TerminalPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
