import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github, Globe, Rocket } from "lucide-react";
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
    // Validate site name
    if (!siteName.trim()) {
      setValidationError("Site name is required");
      return false;
    }

    if (siteName.length < 3) {
      setValidationError("Site name must be at least 3 characters");
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(siteName)) {
      setValidationError("Site name can only contain lowercase letters, numbers, and hyphens");
      return false;
    }

    // Validate GitHub URL
    if (!repoUrl.trim()) {
      setValidationError("GitHub repository URL is required");
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
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsDeploying(true);
    setValidationError(null);

    try {
      console.log("🚀 Starting deployment...");
      console.log("Site Name:", siteName);
      console.log("Repository URL:", repoUrl);

      // Get authentication token
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      // Make API request using the deployment service
      const result = await deploymentApi.deploy({
        repoUrl: repoUrl.trim(),
        siteName: siteName.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("✅ Deployment initiated:", result);
      
      // Set deployment ID for real-time tracking
      if (result.deploymentId) {
        setDeploymentId(result.deploymentId);
      } else {
        // Fallback for immediate success (shouldn't happen with new async approach)
        onSuccess(result);
        setIsDeploying(false);
      }

    } catch (error: any) {
      console.error("❌ Deployment failed:", error);

      let errorMessage = "An unexpected error occurred during deployment";

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Unable to connect to deployment server. Please check if the server is running.";
      } else {
        // Error in request setup
        errorMessage = error.message;
      }

      // Call error callback
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

  const resetForm = () => {
    setSiteName("");
    setRepoUrl("");
    setIsDeploying(false);
    setDeploymentId(null);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Project Configuration
          </CardTitle>
          <CardDescription>
            Enter your project details to deploy to the cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Name Input */}
          <div className="space-y-2">
            <Label htmlFor="siteName" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site Name
            </Label>
            <Input
              id="siteName"
              type="text"
              placeholder="my-awesome-site"
              value={siteName}
              onChange={handleSiteNameChange}
              disabled={isDeploying}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Your site will be available at: <span className="font-mono font-semibold">{siteName || "your-site"}.aitoyz.in</span>
            </p>
          </div>

          {/* GitHub Repository URL Input */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Repository URL
            </Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={handleRepoUrlChange}
              disabled={isDeploying}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Must be a public GitHub repository with a build script
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Deploy Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !siteName || !repoUrl}
              className="flex-1"
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
                  Deploy Project
                </>
              )}
            </Button>
            
            {isDeploying && (
              <Button
                onClick={resetForm}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Example Repositories */}
          {!isDeploying && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Example repositories to try:</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setRepoUrl("https://github.com/THE-OM-PAWAR/gymnacity2");
                    setSiteName("gymnacity");
                  }}
                  className="w-full text-left p-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  <span className="font-mono">Next.js Gym Website</span>
                </button>
                <button
                  onClick={() => {
                    setRepoUrl("https://github.com/vercel/next.js/tree/canary/examples/hello-world");
                    setSiteName("nextjs-hello");
                  }}
                  className="w-full text-left p-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  <span className="font-mono">Next.js Hello World</span>
                </button>
              </div>
            </div>
          )}
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