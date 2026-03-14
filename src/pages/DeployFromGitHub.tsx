import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { RepoCard } from '@/components/RepoCard';
import { DeployModal } from '@/components/DeployModal';
import { DeploymentLogs, type LogEntry } from '@/components/DeploymentLogs';
import { githubApi, type Repository } from '@/services/github';
import { projectsApi } from '@/services/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Github, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DeployFromGitHub = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<LogEntry[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'deploying' | 'deployed' | 'failed'>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    checkGitHubAndLoadRepos();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepos(filtered);
    } else {
      setFilteredRepos(repositories);
    }
  }, [searchQuery, repositories]);

  const checkGitHubAndLoadRepos = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const status = await githubApi.getStatus(token);
      setGithubConnected(status.connected);

      if (status.connected) {
        const repos = await githubApi.getRepositories(token);
        setRepositories(repos);
        setFilteredRepos(repos);
      }
    } catch (error) {
      console.error('Error loading repositories:', error);
      toast.error('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployClick = (repo: Repository) => {
    setSelectedRepo(repo);
    setDeployModalOpen(true);
  };

  const handleDeploy = async (data: { repoOwner: string; repoName: string; branch: string; projectName: string; subdomain: string }) => {
    try {
      setDeploying(true);
      setDeploymentLogs([]);
      setDeploymentStatus('deploying');

      const token = await getToken();
      if (!token) return;

      // Connect to Socket.IO
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const newSocket = io(API_URL.replace('/api', ''));
      setSocket(newSocket);

      newSocket.on('connect', async () => {
        console.log('Socket connected:', newSocket.id);

        // Listen for deployment events
        newSocket.on('deployment:progress', (logData: any) => {
          setDeploymentLogs(prev => [...prev, {
            timestamp: logData.timestamp || new Date().toISOString(),
            message: logData.message,
            type: logData.type || 'info'
          }]);
        });

        newSocket.on('deployment:error', (errorData: any) => {
          setDeploymentLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: errorData.message,
            type: 'error'
          }]);
          setDeploymentStatus('failed');
          setDeploying(false);
          toast.error('Deployment failed');
        });

        // Start deployment
        await projectsApi.deploy(token, {
          repoOwner: data.repoOwner,
          repoName: data.repoName,
          branch: data.branch,
          subdomain: data.subdomain
        }, newSocket.id);

        toast.success('Deployment started!');
      });

      // Simulate completion after some time (you can improve this with actual completion event)
      setTimeout(() => {
        if (deploymentStatus === 'deploying') {
          setDeploymentStatus('deployed');
          setDeploying(false);
          toast.success('Deployment completed successfully!');
        }
      }, 60000); // 1 minute timeout

    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.response?.data?.message || 'Failed to start deployment');
      setDeploymentStatus('failed');
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!githubConnected) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto p-6 max-w-3xl">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to connect your GitHub account first.{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate('/dashboard/integrations')}
                  >
                    Go to Integrations
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Deploy from GitHub</h1>
              <p className="text-muted-foreground">
                Select a repository to deploy
              </p>
            </div>

            {deploying && (
              <div className="mb-6">
                <DeploymentLogs logs={deploymentLogs} status={deploymentStatus} />
              </div>
            )}

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'No repositories available'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.fullName}
                    repo={repo}
                    onDeploy={handleDeployClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <DeployModal
        open={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        repo={selectedRepo}
        onDeploy={handleDeploy}
      />
    </div>
  );
};

export default DeployFromGitHub;
