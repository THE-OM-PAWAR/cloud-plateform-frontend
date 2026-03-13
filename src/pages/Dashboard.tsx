import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { 
  Plus, 
  Search, 
  ExternalLink,
  GitBranch,
  Clock,
  Loader2,
  Activity,
  Server,
  TrendingUp,
  Zap,
  MoreVertical
} from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const token = await getToken();
          await api.post('/auth/sync-user', { clerkId: user.id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const response = await api.get('/user/projects', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProjects(response.data.projects || []);
        } catch (error) {
          console.error('Failed to sync user:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    syncUser();
  }, [user, getToken]);

  const filteredProjects = userProjects.filter((project: any) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.repositoryUrl && project.repositoryUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: userProjects.length,
    deployed: userProjects.filter((p: any) => p.status === 'deployed').length,
    deploying: userProjects.filter((p: any) => p.status === 'deploying').length,
    failed: userProjects.filter((p: any) => p.status === 'failed').length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className?: string }> = {
      deployed: { variant: "default", label: "Ready", className: "bg-green-500 hover:bg-green-600" },
      deploying: { variant: "secondary", label: "Building" },
      failed: { variant: "destructive", label: "Error" },
      stopped: { variant: "outline", label: "Stopped" },
      pending: { variant: "secondary", label: "Queued" }
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={`text-xs ${config.className || ''}`}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your deployments and activity
            </p>
          </div>
          <Button onClick={() => navigate("/create-project")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.deployed} deployed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deployed}</div>
              <p className="text-xs text-muted-foreground">
                Running successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Building</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deploying}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.deployed / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.failed} failed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            {userProjects.length > 0 && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 && userProjects.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <GitBranch className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No projects yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Get started by deploying your first project from a Git repository
                  </p>
                </div>
                <Button onClick={() => navigate("/create-project")} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project: any) => (
                <Card 
                  key={project._id} 
                  className="hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {project.name}
                          {getStatusBadge(project.status)}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          <span className="truncate">
                            {project.repositoryUrl.replace('https://github.com/', '')}
                          </span>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => project.status === 'deployed' && window.open(`https://${project.subdomain}.aitoyz.in`, '_blank')}
                            disabled={project.status !== 'deployed'}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Site
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.status === 'deployed' && (
                      <div className="p-2 rounded-md bg-muted/50 border">
                        <p className="text-xs text-muted-foreground mb-1">Production</p>
                        <code className="text-xs font-mono">
                          {project.subdomain}.aitoyz.in
                        </code>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      {project.port > 0 && (
                        <span className="font-mono">:{project.port}</span>
                      )}
                    </div>

                    {project.status === 'deployed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`https://${project.subdomain}.aitoyz.in`, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Visit
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {userProjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest deployments and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProjects.slice(0, 5).map((project: any) => (
                  <div key={project._id} className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${
                      project.status === 'deployed' ? 'bg-green-500' :
                      project.status === 'deploying' ? 'bg-blue-500' :
                      project.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.status === 'deployed' ? 'Deployed successfully' :
                         project.status === 'deploying' ? 'Building...' :
                         project.status === 'failed' ? 'Deployment failed' :
                         'Queued for deployment'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(project.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
