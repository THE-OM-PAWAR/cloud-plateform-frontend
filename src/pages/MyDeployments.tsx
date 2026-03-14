import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  ExternalLink,
  Play,
  Square,
  Trash2,
  FileText,
  AlertCircle,
  Package,
  AlertTriangle,
  GitBranch,
  Search,
  RefreshCw,
} from 'lucide-react';
import { appsApi, type AppDeployment, type App } from '@/services/appsApi';
import { api } from '@/services/api';
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

type DeploymentType = 'app' | 'github';

interface UnifiedDeployment {
  _id: string;
  name: string;
  type: DeploymentType;
  status: string;
  url?: string;
  subdomain?: string;
  port?: number;
  createdAt: string;
  // app-specific
  appDeployment?: AppDeployment;
  // github-specific
  githubProject?: any;
}

const STATUS_STYLES: Record<string, string> = {
  running:   'bg-green-500/10 text-green-500 border-green-500/20',
  deployed:  'bg-green-500/10 text-green-500 border-green-500/20',
  deploying: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  building:  'bg-blue-500/10 text-blue-500 border-blue-500/20',
  stopped:   'bg-gray-500/10 text-gray-500 border-gray-500/20',
  failed:    'bg-red-500/10 text-red-500 border-red-500/20',
  pending:   'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

const STATUS_LABEL: Record<string, string> = {
  running: 'Running', deployed: 'Ready', deploying: 'Building',
  building: 'Building', stopped: 'Stopped', failed: 'Failed', pending: 'Queued',
};

export function MyDeployments() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [all, setAll] = useState<UnifiedDeployment[]>([]);
  const [filtered, setFiltered] = useState<UnifiedDeployment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsTitle, setLogsTitle] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UnifiedDeployment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? all.filter(d => d.name.toLowerCase().includes(q)) : all);
  }, [search, all]);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const [appDeps, githubRes] = await Promise.allSettled([
        appsApi.getUserDeployments(token),
        api.get('/user/projects', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const unified: UnifiedDeployment[] = [];

      if (appDeps.status === 'fulfilled') {
        appDeps.value.forEach((d) => {
          unified.push({
            _id: d._id,
            name: d.projectName,
            type: 'app',
            status: d.status,
            url: d.url,
            subdomain: d.subdomain,
            port: d.port,
            createdAt: d.createdAt,
            appDeployment: d,
          });
        });
      }

      if (githubRes.status === 'fulfilled') {
        const projects: any[] = githubRes.value.data.projects || [];
        projects.forEach((p) => {
          unified.push({
            _id: p._id,
            name: p.name || p.projectName,
            type: 'github',
            status: p.status,
            url: p.url,
            subdomain: p.subdomain,
            port: p.port,
            createdAt: p.createdAt,
            githubProject: p,
          });
        });
      }

      unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAll(unified);
    } catch (err: any) {
      setError(err.message || 'Failed to load deployments');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (d: UnifiedDeployment) => {
    try {
      const token = await getToken();
      if (!token) return;
      if (d.type === 'app') await appsApi.startDeployment(d.name, token);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const handleStop = async (d: UnifiedDeployment) => {
    try {
      const token = await getToken();
      if (!token) return;
      if (d.type === 'app') await appsApi.stopDeployment(d.name, token);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      if (toDelete.type === 'app') {
        await appsApi.deleteDeployment(toDelete.name, token);
      } else {
        await api.delete(`/deploy/${toDelete.name}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      setDeleteOpen(false);
      setToDelete(null);
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setIsDeleting(false); }
  };

  const handleLogs = async (d: UnifiedDeployment) => {
    try {
      const token = await getToken();
      if (!token) return;
      let logsData = '';
      if (d.type === 'app') {
        logsData = await appsApi.getDeploymentLogs(d.name, token, 100);
      }
      setLogs(logsData || 'No logs available');
      setLogsTitle(d.name);
      setLogsOpen(true);
    } catch (err: any) { setError(err.message); }
  };

  const getAppName = (d: AppDeployment) => {
    if (!d.app || typeof d.app === 'string') return 'App Marketplace';
    return (d.app as App).name || 'App Marketplace';
  };

  const isActive = (status: string) => status === 'running' || status === 'deployed';

  const displayList = filtered.length > 0 || search ? filtered : all;

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deployments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {all.length} total — {all.filter(d => isActive(d.status)).length} active
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        {all.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deployments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No deployments found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search term' : 'Deploy a project to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden">
            {displayList.map((d) => (
              <div key={d._id} className="flex items-center gap-4 px-4 py-3 bg-background hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => navigate(`/project/${d.type}/${d.type === 'github' ? (d.subdomain || d.name) : d.name}`)}>
                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  {d.type === 'github'
                    ? <GitBranch className="h-4 w-4 text-muted-foreground" />
                    : <Package className="h-4 w-4 text-muted-foreground" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{d.name}</span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_STYLES[d.status] ?? STATUS_STYLES.pending}`}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {d.type === 'github'
                      ? (d.githubProject?.repositoryUrl?.replace('https://github.com/', '') ?? 'GitHub')
                      : (d.appDeployment ? getAppName(d.appDeployment) : 'App Marketplace')
                    }
                    {d.subdomain && ` · ${d.subdomain}.aitoyz.in`}
                  </p>
                </div>

                {/* Date */}
                <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isActive(d.status) && d.url && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                      <a href={d.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {d.status === 'stopped' && d.type === 'app' && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStart(d)}>
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {d.status === 'running' && d.type === 'app' && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStop(d)}>
                      <Square className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {d.type === 'app' && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleLogs(d)}>
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => { setToDelete(d); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logs Dialog */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Logs — {logsTitle}</DialogTitle>
            <DialogDescription>Last 100 lines</DialogDescription>
          </DialogHeader>
          <div className="bg-black text-green-400 p-4 rounded-lg overflow-auto max-h-[60vh] font-mono text-xs">
            <pre>{logs}</pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Deployment
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be undone.</p>
              {toDelete?.type === 'app' && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive/90">
                  This will stop the container, remove Nginx config, SSL cert, and all project files.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
}

export default MyDeployments;
