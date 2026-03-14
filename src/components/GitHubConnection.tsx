import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { githubApi, type GitHubStatus } from '@/services/github';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const GitHubConnection = () => {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<GitHubStatus>({ connected: false, username: null });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const data = await githubApi.getStatus(token);
      setStatus(data);
    } catch (error) {
      console.error('Error checking GitHub status:', error);
      toast.error('Failed to check GitHub connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const token = await getToken();
      if (!token) return;
      
      const authUrl = await githubApi.getAuthUrl(token);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting GitHub:', error);
      toast.error('Failed to initiate GitHub connection');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      await githubApi.disconnect(token);
      setStatus({ connected: false, username: null });
      toast.success('GitHub account disconnected');
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast.error('Failed to disconnect GitHub account');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
            <Github className="h-5 w-5 text-background" />
          </div>
          <div>
            <CardTitle>GitHub</CardTitle>
            <CardDescription>Connect your GitHub account to deploy repositories</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {status.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Username:</span> {status.username}
            </div>
            <Button onClick={handleDisconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to access your repositories and deploy them with one click.
            </p>
            <Button onClick={handleConnect} disabled={connecting} className="w-full sm:w-auto">
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Connect GitHub
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
