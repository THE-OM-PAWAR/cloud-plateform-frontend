import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { projectsApi, type Project } from '@/services/projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical, ExternalLink, Play, Square, Trash2, GitBranch, Rocket, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const Projects = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const data = await projectsApi.getAll(token);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await projectsApi.stop(token, id);
      toast.success('Project stopped');
      loadProjects();
    } catch (error) {
      console.error('Error stopping project:', error);
      toast.error('Failed to stop project');
    }
  };

  const handleRestart = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await projectsApi.restart(token, id);
      toast.success('Project restarted');
      loadProjects();
    } catch (error) {
      console.error('Error restarting project:', error);
      toast.error('Failed to restart project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = await getToken();
      if (!token) return;

      await projectsApi.delete(token, id);
      toast.success('Project deleted');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const variants: Record<Project['status'], { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      deploying: { variant: 'default', label: 'Deploying' },
      deployed: { variant: 'default', label: 'Deployed' },
      failed: { variant: 'destructive', label: 'Failed' },
      stopped: { variant: 'outline', label: 'Stopped' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Projects</h1>
                <p className="text-muted-foreground">
                  Manage your deployed projects
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard/deploy')}>
                <Rocket className="mr-2 h-4 w-4" />
                New Deployment
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">Deploy your first project to get started</p>
                  <Button onClick={() => navigate('/dashboard/deploy')}>
                    Deploy Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card 
                    key={project._id} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/project/github/${project.subdomain || project.name}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{project.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {project.repoOwner}/{project.repoName}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            {project.status === 'deployed' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStop(project._id)}>
                                  <Square className="mr-2 h-4 w-4" />
                                  Stop
                                </DropdownMenuItem>
                                {project.deployedUrl && (
                                  <DropdownMenuItem onClick={() => window.open(project.deployedUrl, '_blank')}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {project.status === 'stopped' && (
                              <DropdownMenuItem onClick={() => handleRestart(project._id)}>
                                <Play className="mr-2 h-4 w-4" />
                                Restart
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(project._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(project.status)}
                        {project.sslEnabled && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            SSL
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span>{project.branch}</span>
                      </div>

                      {project.deployedUrl && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <a 
                            href={project.deployedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate"
                          >
                            {project.deployedUrl}
                          </a>
                        </div>
                      )}

                      {project.subdomain && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Subdomain:</span> {project.subdomain}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projects;
