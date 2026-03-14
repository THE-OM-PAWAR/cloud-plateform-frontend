import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Loader2, ExternalLink, GitBranch, Package, Play, Square,
  Trash2, RefreshCw, ArrowLeft, AlertCircle, AlertTriangle,
  Copy, Check, RotateCcw, ChevronDown, ChevronRight,
  Globe, Server, Clock, Share2, FileText,
} from 'lucide-react';
import { api } from '@/services/api';
import { appsApi, type AppDeployment, type App } from '@/services/appsApi';

type ProjectType = 'github' | 'app';
type TabType = 'deployment' | 'logs' | 'source';

interface ProjectData {
  type: ProjectType;
  github?: { _id: string; name: string; repositoryUrl: string; subdomain: string; port: number; status: string; createdAt: string; updatedAt: string; };
  app?: AppDeployment & { containerStatus?: any };
}

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-green-500/10 text-green-600 border-green-500/20',
  deployed: 'bg-green-500/10 text-green-600 border-green-500/20',
  deploying: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  stopped: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

const STATUS_DOT: Record<string, string> = {
  running: 'bg-green-500', deployed: 'bg-green-500',
  deploying: 'bg-blue-500 animate-pulse', stopped: 'bg-gray-400',
  failed: 'bg-red-500', pending: 'bg-yellow-500 animate-pulse',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Collapsible({ title, badge, right, children, defaultOpen = false }: {
  title: string; badge?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-sm font-medium">
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {title}
          {badge}
        </span>
        {right && <span className="text-muted-foreground text-xs">{right}</span>}
      </button>
      {open && <div className="border-t px-4 py-4 bg-muted/20">{children}</div>}
    </div>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function ProjectDetail() {
  const { type, name } = useParams<{ type: string; name: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>('deployment');
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const projectType = type as ProjectType;

  useEffect(() => { load(); }, [name, type]);
  useEffect(() => {
    if (tab === 'logs' && !logs) fetchLogs();
  }, [tab]);

  const load = async () => {
    if (!name || !type) return;
    try {
      setLoading(true); setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      if (projectType === 'github') {
        const res = await api.get(`/deploy/${name}`, { headers: { Authorization: `Bearer ${token}` } });
        setData({ type: 'github', github: res.data.project });
      } else {
        const dep = await appsApi.getDeploymentDetails(name, token);
        setData({ type: 'app', app: dep as any });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load project');
    } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    if (!name || projectType !== 'app') return;
    setLogsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const logsData = await appsApi.getDeploymentLogs(name, token, 300);
      setLogs(logsData || 'No logs available');
    } catch (err: any) { setLogs('Failed to fetch logs: ' + err.message); }
    finally { setLogsLoading(false); }
  };

  const handleAction = async (action: 'start' | 'stop' | 'redeploy') => {
    if (!name) return;
    setActionLoading(action);
    try {
      const token = await getToken();
      if (!token) return;
      if (action === 'redeploy') await api.post(`/deploy/${name}/redeploy`, {}, { headers: { Authorization: `Bearer ${token}` } });
      else if (action === 'start') await appsApi.startDeployment(name, token);
      else if (action === 'stop') await appsApi.stopDeployment(name, token);
      await load();
    } catch (err: any) { setError(err.response?.data?.message || err.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!name) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      if (projectType === 'github') await api.delete(`/deploy/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      else await appsApi.deleteDeployment(name, token);
      navigate('/apps/deployments');
    } catch (err: any) { setError(err.response?.data?.message || err.message); setIsDeleting(false); setDeleteOpen(false); }
  };

  const status = data?.github?.status ?? data?.app?.status ?? '';
  const projectName = data?.github?.name ?? data?.app?.projectName ?? name ?? '';
  const subdomain = data?.github?.subdomain ?? data?.app?.subdomain ?? name ?? '';
  const port = data?.github?.port ?? data?.app?.port;
  const url = data?.app?.url ?? (subdomain ? `https://${subdomain}.aitoyz.in` : null);
  const createdAt = data?.github?.createdAt ?? data?.app?.createdAt ?? '';
  const updatedAt = data?.github?.updatedAt ?? data?.app?.updatedAt ?? '';
  const isActive = status === 'running' || status === 'deployed';
  const appName = data?.app?.app && typeof data.app.app !== 'string' ? (data.app.app as App).name : null;
  const repoUrl = data?.github?.repositoryUrl;
  const repoShort = repoUrl?.replace('https://github.com/', '');

  const TABS: { id: TabType; label: string }[] = [
    { id: 'deployment', label: 'Deployment' },
    { id: 'logs', label: 'Logs' },
    { id: 'source', label: 'Source' },
  ];

  return (
    <AuthLayout>
      {/* Top breadcrumb bar */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-1">
          <Link to="/apps/deployments" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Deployments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium truncate">{projectName}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
        ) : data && (
          <>
            {/* Header row */}
            <div className="flex items-center justify-between mt-4 mb-5 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                  {projectType === 'github' ? <GitBranch className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight">{projectName}</h1>
                  {appName && <p className="text-xs text-muted-foreground">{appName}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                {isActive && url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Visit</a>
                  </Button>
                )}
                {projectType === 'github' && (
                  <Button size="sm" variant="outline" onClick={() => handleAction('redeploy')} disabled={!!actionLoading}>
                    {actionLoading === 'redeploy' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 mr-1.5" />}Redeploy
                  </Button>
                )}
                {projectType === 'app' && status === 'stopped' && (
                  <Button size="sm" variant="outline" onClick={() => handleAction('start')} disabled={!!actionLoading}>
                    {actionLoading === 'start' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}Start
                  </Button>
                )}
                {projectType === 'app' && status === 'running' && (
                  <Button size="sm" variant="outline" onClick={() => handleAction('stop')} disabled={!!actionLoading}>
                    {actionLoading === 'stop' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Square className="h-3.5 w-3.5 mr-1.5" />}Stop
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive border-destructive/20" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6 gap-0">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── DEPLOYMENT TAB ── */}
            {tab === 'deployment' && (
              <div className="space-y-4">
                {/* Main card: preview + meta */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="text-sm font-medium">Deployment Details</span>
                    <div className="flex items-center gap-2">
                      {url && isActive && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer"><Share2 className="h-3.5 w-3.5" />Share</a>
                        </Button>
                      )}
                      {projectType === 'app' && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => setTab('logs')}>
                          <FileText className="h-3.5 w-3.5" />Logs
                        </Button>
                      )}
                      {isActive && url && (
                        <Button size="sm" className="h-7 text-xs gap-1.5" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" />Visit</a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-0">
                    {/* Preview */}
                    <div className="md:w-[340px] shrink-0 border-r bg-muted/30 p-3">
                      <div className="rounded-md overflow-hidden border bg-background aspect-video relative">
                        {isActive && url && !previewError ? (
                          <>
                            {/* Browser chrome */}
                            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted border-b">
                              <div className="h-2 w-2 rounded-full bg-red-400" />
                              <div className="h-2 w-2 rounded-full bg-yellow-400" />
                              <div className="h-2 w-2 rounded-full bg-green-400" />
                              <div className="flex-1 mx-2 bg-background rounded text-[10px] text-muted-foreground px-2 py-0.5 truncate border">
                                {url.replace('https://', '')}
                              </div>
                            </div>
                            <iframe
                              src={url}
                              className="w-full h-full"
                              style={{ height: '200px', transform: 'scale(1)', transformOrigin: 'top left' }}
                              sandbox="allow-scripts allow-same-origin allow-forms"
                              onError={() => setPreviewError(true)}
                              title="Site preview"
                            />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2 text-muted-foreground">
                            {isActive && previewError ? (
                              <>
                                <Globe className="h-8 w-8 opacity-30" />
                                <p className="text-xs text-center px-4">Preview blocked by site's security policy</p>
                                {url && (
                                  <a href={url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1">
                                    Open in new tab <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </>
                            ) : (
                              <>
                                <Globe className="h-8 w-8 opacity-30" />
                                <p className="text-xs">
                                  {status === 'deploying' ? 'Deploying...' : status === 'failed' ? 'Deployment failed' : 'Not running'}
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 p-5 grid grid-cols-2 gap-x-8 gap-y-5 content-start">
                      <MetaItem label="Created">
                        <span className="flex items-center gap-1.5 font-normal text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {createdAt ? new Date(createdAt).toLocaleString() : '—'}
                        </span>
                      </MetaItem>
                      <MetaItem label="Status">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status] ?? 'bg-gray-400'}`} />
                          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[status] ?? ''}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </span>
                      </MetaItem>
                      <MetaItem label="Domains">
                        <div className="space-y-1 font-normal">
                          {subdomain && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-mono text-xs truncate">{subdomain}.aitoyz.in</span>
                              <CopyButton value={`${subdomain}.aitoyz.in`} />
                            </div>
                          )}
                          {url && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0" />
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="font-mono text-xs text-primary hover:underline truncate flex items-center gap-1">
                                {url} <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </MetaItem>
                      <MetaItem label="Environment">
                        <span className="flex items-center gap-1.5 font-normal text-sm">
                          <Server className="h-3.5 w-3.5 text-muted-foreground" />
                          Production
                          <Badge variant="outline" className="text-xs ml-1">Current</Badge>
                        </span>
                      </MetaItem>
                      {repoUrl && (
                        <MetaItem label="Source">
                          <div className="space-y-1 font-normal">
                            <div className="flex items-center gap-1.5 text-sm">
                              <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs">main</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="h-3.5 w-3.5 opacity-0 shrink-0" />
                              <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-mono text-primary hover:underline truncate flex items-center gap-1">
                                {repoShort} <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </MetaItem>
                      )}
                      {port && (
                        <MetaItem label="Port">
                          <span className="flex items-center gap-1.5 font-mono text-sm font-normal">
                            {port} <CopyButton value={String(port)} />
                          </span>
                        </MetaItem>
                      )}
                      {data.app?.containerName && (
                        <MetaItem label="Container">
                          <span className="font-mono text-xs font-normal">{data.app.containerName}</span>
                        </MetaItem>
                      )}
                      {data.app?.resources && (
                        <MetaItem label="Resources">
                          <span className="text-sm font-normal">CPU {data.app.resources.cpu} · RAM {data.app.resources.memory}</span>
                        </MetaItem>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {data.app?.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{data.app.errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Collapsible sections */}
                <Collapsible title="Deployment Settings" badge={<Badge variant="secondary" className="text-xs ml-2">Info</Badge>}>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Project Name</span><span className="text-foreground font-mono">{projectName}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span>Type</span><span className="text-foreground">{projectType === 'github' ? 'GitHub' : 'App Marketplace'}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span>Last Updated</span><span className="text-foreground">{updatedAt ? new Date(updatedAt).toLocaleString() : '—'}</span></div>
                  </div>
                </Collapsible>

                {projectType === 'app' && (
                  <Collapsible title="Build Logs" right={<span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${STATUS_DOT[status] ?? 'bg-gray-400'}`} />{status}</span>}>
                    <Button size="sm" variant="outline" onClick={() => setTab('logs')}>
                      <FileText className="h-3.5 w-3.5 mr-1.5" />View Full Logs
                    </Button>
                  </Collapsible>
                )}

                <Collapsible title="Deployment Summary">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground text-xs mb-1">Subdomain</p><p className="font-mono text-xs">{subdomain}.aitoyz.in</p></div>
                    <div><p className="text-muted-foreground text-xs mb-1">Status</p><p>{status}</p></div>
                    <div><p className="text-muted-foreground text-xs mb-1">Created</p><p>{createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</p></div>
                    {port && <div><p className="text-muted-foreground text-xs mb-1">Port</p><p className="font-mono">{port}</p></div>}
                  </div>
                </Collapsible>
              </div>
            )}

            {/* ── LOGS TAB ── */}
            {tab === 'logs' && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <span className="text-sm font-medium">Container Logs</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={fetchLogs} disabled={logsLoading}>
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${logsLoading ? 'animate-spin' : ''}`} />Refresh
                  </Button>
                </div>
                <div className="bg-zinc-950 text-green-400 p-4 font-mono text-xs min-h-[400px] overflow-auto">
                  {projectType !== 'app' ? (
                    <p className="text-zinc-500">Logs are only available for App Marketplace deployments.</p>
                  ) : logsLoading ? (
                    <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" />Loading logs...</div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all">{logs || 'No logs available'}</pre>
                  )}
                </div>
              </div>
            )}

            {/* ── SOURCE TAB ── */}
            {tab === 'source' && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30">
                  <span className="text-sm font-medium">Source</span>
                </div>
                <div className="p-6 space-y-4">
                  {repoUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <GitBranch className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Repository</p>
                          <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-mono text-primary hover:underline truncate flex items-center gap-1">
                            {repoShort} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <GitBranch className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Branch</p>
                          <p className="text-sm font-mono">main</p>
                        </div>
                      </div>
                    </div>
                  ) : appName ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Package className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">App</p>
                        <p className="text-sm font-medium">{appName}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No source information available.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />Delete {projectName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deployment and all associated resources. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4 mr-2" />Delete</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
}
