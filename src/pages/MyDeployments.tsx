import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  ExternalLink, 
  Play, 
  Square, 
  Trash2, 
  FileText,
  AlertCircle,
  Package,
  AlertTriangle
} from 'lucide-react';
import { appsApi, type AppDeployment, type App } from '@/services/appsApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function MyDeployments() {
  const { getToken } = useAuth();
  const [deployments, setDeployments] = useState<AppDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<AppDeployment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await appsApi.getUserDeployments(token);
      setDeployments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load deployments');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (projectName: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await appsApi.startDeployment(projectName, token);
      await loadDeployments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start deployment');
    }
  };

  const handleStop = async (projectName: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await appsApi.stopDeployment(projectName, token);
      await loadDeployments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to stop deployment');
    }
  };

  const handleDelete = async (projectName: string) => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await appsApi.deleteDeployment(projectName, token);
      setDeleteDialogOpen(false);
      setDeploymentToDelete(null);
      await loadDeployments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete deployment');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (deployment: AppDeployment) => {
    setDeploymentToDelete(deployment);
    setDeleteDialogOpen(true);
  };

  const handleViewLogs = async (projectName: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const logsData = await appsApi.getDeploymentLogs(projectName, token, 100);
      setLogs(logsData);
      setSelectedDeployment(projectName);
      setLogsDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'deploying':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'stopped':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getAppName = (deployment: AppDeployment): string => {
    if (!deployment.app) return 'Unknown App';
    if (typeof deployment.app === 'string') return 'Unknown App';
    return (deployment.app as App).name || 'Unknown App';
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Deployments</h1>
          <p className="text-muted-foreground">
            Manage your deployed applications
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : deployments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
            <p className="text-muted-foreground mb-4">
              Deploy your first app from the marketplace
            </p>
            <Button onClick={() => window.location.href = '/apps'}>
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {deployments.map(deployment => (
              <Card key={deployment._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {deployment.projectName}
                        <Badge variant="outline" className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getAppName(deployment)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Subdomain:</span>
                        <div className="font-medium">{deployment.subdomain}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Port:</span>
                        <div className="font-medium">{deployment.port}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Container:</span>
                        <div className="font-medium truncate">{deployment.containerName}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">
                          {new Date(deployment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {deployment.url && (
                      <div>
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {deployment.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {deployment.errorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{deployment.errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {deployment.status === 'stopped' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStart(deployment.projectName)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {deployment.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStop(deployment.projectName)}
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLogs(deployment.projectName)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(deployment)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Logs Dialog */}
        <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Container Logs - {selectedDeployment}</DialogTitle>
              <DialogDescription>Last 100 lines</DialogDescription>
            </DialogHeader>
            <div className="bg-black text-green-400 p-4 rounded-lg overflow-auto max-h-[60vh] font-mono text-xs">
              <pre>{logs || 'No logs available'}</pre>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Deployment
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Are you sure you want to delete <strong>{deploymentToDelete?.projectName}</strong>?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-destructive mb-2">This action will:</p>
                  <ul className="space-y-1 text-destructive/90">
                    <li>• Stop and remove the Docker container</li>
                    <li>• Delete the Nginx configuration</li>
                    <li>• Remove the SSL certificate</li>
                    <li>• Delete all project files</li>
                    <li>• Remove the database record</li>
                  </ul>
                </div>
                <p className="text-destructive font-semibold">
                  This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deploymentToDelete && handleDelete(deploymentToDelete.projectName)}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

export default MyDeployments;
