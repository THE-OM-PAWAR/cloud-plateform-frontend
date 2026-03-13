import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github, Globe, Rocket, AlertCircle } from "lucide-react";
import { deploymentApi, type DeploymentResponse } from "@/services/api";
import { DeploymentProgress } from "./DeploymentProgress";

interface ProjectFormProps {
  onSuccess: (result: DeploymentResponse) => void;
  onError: (error: string) => void;
}

const ProjectForm = ({ onSuccess, onError }: ProjectFormProps) => {
  const { getToken } = useAuth();
  const [siteName, setSiteName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!siteName.trim()) {
      setValidationError("Project name is required");
      return false;
    }

    if (siteName.length < 3) {
      setValidationError("Project name must be at least 3 characters");
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(siteName)) {
      setValidationError("Project name can only contain lowercase letters, numbers, and hyphens");
      return false;
    }

    if (!repoUrl.trim()) {
      setValidationError("Repository URL is required");
      return false;
    }

    const githubPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/;
    if (!githubPattern.test(repoUrl)) {
      setValidationError("Please enter a valid GitHub repository URL");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleDeploy = async () => {
    if (!validateForm()) {
      return;
    }

    setIsDeploying(true);
    setValidationError(null);

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const result = await deploymentApi.deploy({
        repoUrl: repoUrl.trim(),
        siteName: siteName.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (result.deploymentId) {
        setDeploymentId(result.deploymentId);
      } else {
        onSuccess(result);
        setIsDeploying(false);
      }

    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during deployment";

      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Unable to connect to deployment server. Please check if the server is running.";
      } else {
        errorMessage = error.message;
      }

      onError(errorMessage);
      setIsDeploying(false);
    }
  };

  const handleDeploymentComplete = (result: any) => {
    setIsDeploying(false);
    onSuccess(result);
  };

  const handleDeploymentError = (error: any) => {
    setIsDeploying(false);
    onError(error.message);
  };

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSiteName(value);
    setValidationError(null);
  };

  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Project</CardTitle>
          <CardDescription>
            Enter your project details to deploy to the cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Repository URL Input */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Git Repository
            </Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={handleRepoUrlChange}
              disabled={isDeploying}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Must be a public GitHub repository
            </p>
          </div>

          {/* Site Name Input */}
          <div className="space-y-2">
            <Label htmlFor="siteName" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Project Name
            </Label>
            <Input
              id="siteName"
              type="text"
              placeholder="my-awesome-project"
              value={siteName}
              onChange={handleSiteNameChange}
              disabled={isDeploying}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your site will be available at <span className="font-mono font-medium">{siteName || "your-project"}.aitoyz.in</span>
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Deploy Button */}
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !siteName || !repoUrl}
            className="w-full"
            size="lg"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Deployment Progress */}
      {deploymentId && (
        <DeploymentProgress
          deploymentId={deploymentId}
          onComplete={handleDeploymentComplete}
          onError={handleDeploymentError}
        />
      )}
    </div>
  );
};

export default ProjectForm;