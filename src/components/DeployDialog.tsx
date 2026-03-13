import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { App } from '@/services/appsApi';

interface DeployDialogProps {
  app: App | null;
  open: boolean;
  onClose: () => void;
  onDeploy: (projectName: string, envVars: Record<string, string>) => Promise<void>;
}

export function DeployDialog({ app, open, onClose, onDeploy }: DeployDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setProjectName('');
    setEnvVars({});
    setError(null);
    setSuccess(false);
    setIsDeploying(false);
    onClose();
  };

  const handleDeploy = async () => {
    if (!app) return;

    // Validate project name
    if (!projectName || !/^[a-z0-9-]+$/.test(projectName)) {
      setError('Project name must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    // Validate required env vars
    const missingVars = app.env
      .filter(env => env.required && !envVars[env.key])
      .map(env => env.key);

    if (missingVars.length > 0) {
      setError(`Missing required environment variables: ${missingVars.join(', ')}`);
      return;
    }

    setError(null);
    setIsDeploying(true);

    try {
      await onDeploy(projectName, envVars);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Deployment failed');
      setIsDeploying(false);
    }
  };

  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Deploy {app.name}
          </DialogTitle>
          <DialogDescription>
            Configure your deployment settings and environment variables
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">
              Deployment started successfully! Check your deployments page for status.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                placeholder="my-app-instance"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value.toLowerCase())}
                disabled={isDeploying}
              />
              <p className="text-xs text-muted-foreground">
                Use only lowercase letters, numbers, and hyphens. This will be your subdomain.
              </p>
            </div>

            {app.env.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Environment Variables</h3>
                {app.env.map((envVar) => (
                  <div key={envVar.key} className="space-y-2">
                    <Label htmlFor={envVar.key}>
                      {envVar.key}
                      {envVar.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={envVar.key}
                      type={envVar.key.toLowerCase().includes('password') ? 'password' : 'text'}
                      placeholder={envVar.value || envVar.description}
                      value={envVars[envVar.key] || ''}
                      onChange={(e) => setEnvVars({ ...envVars, [envVar.key]: e.target.value })}
                      disabled={isDeploying}
                    />
                    {envVar.description && (
                      <p className="text-xs text-muted-foreground">{envVar.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Resource Allocation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="ml-2 font-medium">{app.resources.cpu} cores</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="ml-2 font-medium">{app.resources.memory}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeploying}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying || success}>
            {isDeploying ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
