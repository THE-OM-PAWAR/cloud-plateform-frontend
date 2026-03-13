import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "@/components/ProjectForm";
import { AuthLayout } from "@/components/AuthLayout";

interface DeploymentResult {
  status: string;
  projectName?: string;
  url?: string;
  port?: number;
  subdomain?: string;
  sslEnabled?: boolean;
}

const CreateProject = () => {
  const navigate = useNavigate();
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploymentSuccess = (result: DeploymentResult) => {
    setDeploymentResult(result);
    setError(null);
  };

  const handleDeploymentError = (errorMessage: string) => {
    setError(errorMessage);
    setDeploymentResult(null);
  };

  const handleReset = () => {
    setDeploymentResult(null);
    setError(null);
  };

  return (
    <AuthLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Deploy New Project</h1>
          <p className="text-muted-foreground">
            Deploy your frontend application from a GitHub repository
          </p>
        </div>

        {/* Deployment Form */}
        {!deploymentResult && !error && (
          <ProjectForm
            onSuccess={handleDeploymentSuccess}
            onError={handleDeploymentError}
          />
        )}

        {/* Success Result */}
        {deploymentResult && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                Deployment Successful!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Your project has been deployed and is now live
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                  <span className="font-mono font-semibold">{deploymentResult.projectName}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">Port:</span>
                  <span className="font-mono">{deploymentResult.port}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-md">
                  <span className="text-sm font-medium text-muted-foreground">SSL:</span>
                  <span className={deploymentResult.sslEnabled ? "text-green-600" : "text-yellow-600"}>
                    {deploymentResult.sslEnabled ? "✓ Enabled" : "⚠ Not Enabled"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded-md border-2 border-green-500">
                <p className="text-sm font-medium text-muted-foreground mb-2">Your site is live at:</p>
                <a
                  href={deploymentResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline break-all"
                >
                  {deploymentResult.url}
                </a>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => window.open(deploymentResult.url, '_blank')}
                  className="flex-1"
                >
                  Visit Site
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Deploy Another
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Result */}
        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                Deployment Failed
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                There was an error deploying your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-md">
                <p className="text-sm font-medium text-muted-foreground mb-2">Error Details:</p>
                <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Deployment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[140px]">Supported Frameworks:</span>
                <span>React, Vite, Next.js (static), Vue, Angular</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[140px]">Build Directories:</span>
                <span>dist/, build/, .next/, out/</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[140px]">Requirements:</span>
                <span>Public GitHub repository with package.json and build script</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[140px]">Deployment Time:</span>
                <span>Typically 2-5 minutes depending on project size</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default CreateProject;