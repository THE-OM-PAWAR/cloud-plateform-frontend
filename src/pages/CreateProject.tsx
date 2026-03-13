import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Deploy New Project</h1>
          <p className="text-muted-foreground mt-2">
            Import your Git repository and deploy it with a single click
          </p>
        </div>

        {/* Deployment Form */}
        {!deploymentResult && !error && <ProjectForm onSuccess={handleDeploymentSuccess} onError={handleDeploymentError} />}

        {/* Success Result */}
        {deploymentResult && (
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-900 dark:text-green-100">
                  Deployment Successful
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your project is now live and accessible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <span className="text-sm text-muted-foreground">Project</span>
                  <span className="font-mono font-medium">{deploymentResult.projectName}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <span className="text-sm text-muted-foreground">Port</span>
                  <span className="font-mono">{deploymentResult.port}</span>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Live URL</p>
                <a
                  href={deploymentResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline break-all"
                >
                  {deploymentResult.url}
                </a>
              </div>

              <div className="flex gap-3 pt-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Result */}
        {error && (
          <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-900 dark:text-red-100">
                  Deployment Failed
                </CardTitle>
              </div>
              <CardDescription className="text-red-700 dark:text-red-300">
                There was an error deploying your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-lg border">
                <p className="text-sm font-medium mb-2">Error Details</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleReset} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthLayout>
  );
};

export default CreateProject;
