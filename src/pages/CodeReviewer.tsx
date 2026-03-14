import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Github, AlertCircle, FileSearch, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { reviewerApi } from '@/services/reviewer';
import { githubApi } from '@/services/github';
import type { Repository } from '@/types/github';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

export const CodeReviewer = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    checkGitHubAndLoadRepos();
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
        const repos = await reviewerApi.getRepositories(token);
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

  const handleReviewClick = (repo: Repository) => {
    navigate(`/dashboard/reviewer/${repo.owner}/${repo.name}`);
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
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <FileSearch className="h-8 w-8" />
                Code Reviewer
              </h1>
              <p className="text-muted-foreground">
                AI-powered repository analysis and documentation generation
              </p>
            </div>

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
                  <Card key={repo.fullName} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {repo.description || 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {repo.language && (
                          <Badge variant="secondary" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span>{repo.defaultBranch}</span>
                        <span>•</span>
                        <span>Updated {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}</span>
                      </div>

                      <Button 
                        onClick={() => handleReviewClick(repo)} 
                        className="w-full"
                        size="sm"
                      >
                        <FileSearch className="mr-2 h-4 w-4" />
                        Review Repository
                      </Button>
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

export default CodeReviewer;
