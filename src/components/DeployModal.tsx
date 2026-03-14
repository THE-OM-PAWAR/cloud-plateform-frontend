import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { type Repository, githubApi, type Branch } from '@/services/github';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  repo: Repository | null;
  onDeploy: (data: { repoOwner: string; repoName: string; branch: string; projectName: string; subdomain: string }) => void;
}

export const DeployModal = ({ open, onClose, repo, onDeploy }: DeployModalProps) => {
  const { getToken } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [deploying, setDeploying] = useState(false);
  
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'platformdomain.com';

  useEffect(() => {
    if (repo && open) {
      setProjectName(repo.name);
      // Generate subdomain from repo name (lowercase, replace special chars with hyphens)
      const generatedSubdomain = repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setSubdomain(generatedSubdomain);
      setSelectedBranch(repo.defaultBranch);
      loadBranches();
    }
  }, [repo, open]);

  const loadBranches = async () => {
    if (!repo) return;
    
    try {
      setLoadingBranches(true);
      const token = await getToken();
      if (!token) return;
      
      const branchList = await githubApi.getBranches(token, repo.owner, repo.name);
      setBranches(branchList);
    } catch (error) {
      console.error('Error loading branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoadingBranches(false);
    }
  };

  const validateSubdomain = (value: string): boolean => {
    if (!value) return false;
    if (value.length < 3 || value.length > 63) return false;
    if (!/^[a-z0-9-]+$/.test(value)) return false;
    if (value.startsWith('-') || value.endsWith('-')) return false;
    return true;
  };

  const handleSubdomainChange = (value: string) => {
    // Auto-format: lowercase and replace invalid chars
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSubdomain(formatted);
  };

  const handleDeploy = async () => {
    if (!repo || !projectName || !selectedBranch || !subdomain) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateSubdomain(subdomain)) {
      toast.error('Invalid subdomain. Use lowercase letters, numbers, and hyphens only (3-63 chars)');
      return;
    }

    setDeploying(true);
    try {
      await onDeploy({
        repoOwner: repo.owner,
        repoName: repo.name,
        branch: selectedBranch,
        projectName,
        subdomain
      });
      onClose();
    } catch (error) {
      console.error('Deployment error:', error);
    } finally {
      setDeploying(false);
    }
  };

  if (!repo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
          <DialogDescription>
            Configure your deployment settings for {repo.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-project"
            />
            <p className="text-xs text-muted-foreground">
              This will be used to identify your deployment
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder="my-app"
                className={!validateSubdomain(subdomain) && subdomain ? 'border-destructive' : ''}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.{baseDomain}</span>
            </div>
            {subdomain && (
              <div className="rounded-md bg-muted p-2">
                <p className="text-xs font-medium mb-1">Your app will be available at:</p>
                <p className="text-xs text-primary font-mono">
                  https://{subdomain}.{baseDomain}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only (3-63 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            {loadingBranches ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading branches...
              </div>
            ) : (
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      {branch.name}
                      {branch.protected && ' (protected)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Repository</p>
            <p className="text-sm text-muted-foreground">{repo.fullName}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={deploying}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeploy} 
            disabled={deploying || !projectName || !selectedBranch || !subdomain || !validateSubdomain(subdomain)}
          >
            {deploying ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
