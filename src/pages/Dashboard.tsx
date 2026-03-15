import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  MoreVertical,
  Package
} from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { api } from "@/services/api";
import { appsApi, type AppDeployment } from "@/services/appsApi";
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
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [appDeployments, setAppDeployments] = useState<AppDeployment[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const githubParam = searchParams.get('github');
    if (githubParam === 'connected' || githubParam === 'error') {
      // Redirect to integrations page to show the animation
      navigate(`/dashboard/integrations?github=${githubParam}`, { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const token = await getToken();
          
          // Sync user
          await api.post('/auth/sync-user', { clerkId: user.id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Fetch GitHub projects
          const projectsResponse = await api.get('/user/projects', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProjects(projectsResponse.data.projects || []);
          
          // Fetch App Marketplace deployments
          if (token) {
            const deploymentsResponse = await appsApi.getUserDeployments(token);
            setAppDeployments(deploymentsResponse || []);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user, getToken]);

  // Combine both types of deployments
  const allDeployments = [
    ...userProjects.map((p: any) => ({ ...p, type: 'github' })),
    ...appDeployments.map((d: any) => ({ ...d, type: 'app', name: d.projectName }))
  ];

  const filteredDeployments = allDeployments.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.repositoryUrl && item.repositoryUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    total: allDeployments.length,
    deployed: allDeployments.filter((p: any) => 
      p.status === 'deployed' || p.status === 'running'
    ).length,
    deploying: allDeployments.filter((p: any) => p.status === 'deploying').length,
    failed: allDeployments.filter((p: any) => p.status === 'failed').length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className?: string }> = {
      deployed: { variant: "default", label: "Ready", className: "bg-green-500 hover:bg-green-600" },
      running: { variant: "default", label: "Running", className: "bg-green-500 hover:bg-green-600" },
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/apps")}>
              <Package className="mr-2 h-4 w-4" />
              Marketplace
            </Button>
            <Button onClick={() => navigate("/create-project")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {userProjects.length} GitHub + {appDeployments.length} Apps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
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

        {/* Deployments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">All Deployments</h2>
            {allDeployments.length > 0 && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deployments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Deployments List */}
          {filteredDeployments.length === 0 && allDeployments.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <GitBranch className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No deployments yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Deploy from GitHub or browse the App Marketplace
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => navigate("/create-project")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Deploy GitHub
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/apps")}>
                    <Package className="mr-2 h-4 w-4" />
                    Browse Apps
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDeployments.map((deployment: any) => (
                <Card 
                  key={deployment._id} 
                  className="hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {deployment.name}
                          {getStatusBadge(deployment.status)}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          {deployment.type === 'github' ? (
                            <>
                              <GitBranch className="h-3 w-3" />
                              <span className="truncate">
                                {deployment.repositoryUrl.replace('https://github.com/', '')}
                              </span>
                            </>
                          ) : (
                            <>
                              <Package className="h-3 w-3" />
                              <span className="truncate">App Marketplace</span>
                            </>
                          )}
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
                            onClick={() => {
                              const isActive = deployment.status === 'deployed' || deployment.status === 'running';
                              if (isActive) {
                                const url = deployment.url || `https://${deployment.subdomain}.aitoyz.in`;
                                window.open(url, '_blank');
                              }
                            }}
                            disabled={deployment.status !== 'deployed' && deployment.status !== 'running'}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Site
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (deployment.type === 'app') {
                                navigate('/apps/deployments');
                              }
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(deployment.status === 'deployed' || deployment.status === 'running') && (
                      <div className="p-2 rounded-md bg-muted/50 border">
                        <p className="text-xs text-muted-foreground mb-1">Production</p>
                        <code className="text-xs font-mono">
                          {deployment.subdomain}.aitoyz.in
                        </code>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(deployment.createdAt)}</span>
                      </div>
                      {deployment.port > 0 && (
                        <span className="font-mono">:{deployment.port}</span>
                      )}
                    </div>

                    {(deployment.status === 'deployed' || deployment.status === 'running') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const url = deployment.url || `https://${deployment.subdomain}.aitoyz.in`;
                          window.open(url, '_blank');
                        }}
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
        {allDeployments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest deployments and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allDeployments.slice(0, 5).map((deployment: any) => (
                  <div key={deployment._id} className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${
                      deployment.status === 'deployed' || deployment.status === 'running' ? 'bg-green-500' :
                      deployment.status === 'deploying' ? 'bg-blue-500' :
                      deployment.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {deployment.name}
                        {deployment.type === 'app' && (
                          <Badge variant="outline" className="text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            App
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deployment.status === 'deployed' || deployment.status === 'running' ? 'Deployed successfully' :
                         deployment.status === 'deploying' ? 'Building...' :
                         deployment.status === 'failed' ? 'Deployment failed' :
                         'Queued for deployment'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(deployment.createdAt)}
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
