import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { 
  Terminal, 
  Plus, 
  Search, 
  Server, 
  Activity, 
  Clock, 
  Settings,
  MoreHorizontal,
  Cloud
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthLayout } from "@/components/AuthLayout";
import { api } from "@/services/api";

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
          // Sync user with backend
          await api.post('/auth/sync-user', { clerkId: user.id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Fetch user projects
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

  // Use real projects if available, otherwise show empty state
  const projectsToDisplay = userProjects.length > 0 ? userProjects : [];
  
  const filteredProjects = projectsToDisplay.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.repositoryUrl && project.repositoryUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-500";
      case "deploying":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "stopped":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Deployed</Badge>;
      case "deploying":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Deploying</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case "stopped":
        return <Badge variant="secondary">Stopped</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthLayout>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-73px)]">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">OVERVIEW</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10">
                    <Activity className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Server className="mr-2 h-4 w-4" />
                    Servers
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Terminal className="mr-2 h-4 w-4" />
                    Sessions
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">TOOLS</h3>
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate("/bash")}
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    Terminal
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-muted-foreground">Manage your servers and terminal sessions</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/create-project")} variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
                <Button onClick={() => navigate("/bash")} variant="outline">
                  <Terminal className="mr-2 h-4 w-4" />
                  New Terminal
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProjects.length}</div>
                <p className="text-xs text-muted-foreground">{userProjects.filter(p => p.status === 'deployed').length} deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                <Terminal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProjects.filter(p => p.status === 'deploying').length}</div>
                <p className="text-xs text-muted-foreground">Currently deploying</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
                <Cloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4GB</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Connection Test - Add this for debugging */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Backend Connection Status</h2>
            <ConnectionTest />
          </div>

          {/* Projects Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            
            {filteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Server className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Deploy your first project to get started
                    </p>
                    <Button onClick={() => navigate("/create-project")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Project
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project: any) => (
                  <Card key={project._id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                          <div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <CardDescription className="text-xs truncate max-w-[200px]">
                              {project.subdomain}.aitoyz.in
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => window.open(`https://${project.subdomain}.aitoyz.in`, '_blank')}
                              disabled={project.status !== 'deployed'}
                            >
                              <Cloud className="mr-2 h-4 w-4" />
                              Visit Site
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          {getStatusBadge(project.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Port</span>
                          <span className="text-sm font-medium">{project.port}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Repository</span>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {project.repositoryUrl.split('/').slice(-2).join('/')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Deployed</span>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(project.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          className="w-full" 
                          variant={project.status === "deployed" ? "default" : "outline"}
                          onClick={() => window.open(`https://${project.subdomain}.aitoyz.in`, '_blank')}
                          disabled={project.status !== 'deployed'}
                        >
                          <Cloud className="mr-2 h-4 w-4" />
                          {project.status === "deployed" ? "Visit Site" : "Deploying..."}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthLayout>
  );
};

export default Dashboard;