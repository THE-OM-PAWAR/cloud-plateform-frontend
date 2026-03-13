import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/components/theme-provider";
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
import { ProtectedRoute } from "@/auth/ProtectedRoute";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="clouddeploy-theme">
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
