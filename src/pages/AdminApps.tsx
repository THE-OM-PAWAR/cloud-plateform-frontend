import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { appsApi, type App, type EnvVar, type CreateAppRequest } from '@/services/appsApi';

export function AdminApps() {
  const { getToken } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateAppRequest>({
    name: '',
    slug: '',
    description: '',
    category: 'other',
    logo: '',
    deploymentType: 'docker',
    dockerImage: '',
    defaultPort: 8080,
    env: [],
    resources: {
      cpu: '1.0',
      memory: '512m'
    }
  });

  const [newEnvVar, setNewEnvVar] = useState<EnvVar>({
    key: '',
    value: '',
    description: '',
    required: false
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await appsApi.getAllAppsAdmin(token);
      setApps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleResourceChange = (field: 'cpu' | 'memory', value: string) => {
    setFormData(prev => ({
      ...prev,
      resources: { ...prev.resources, [field]: value }
    }));
  };

  const addEnvVar = () => {
    if (!newEnvVar.key) return;
    
    setFormData(prev => ({
      ...prev,
      env: [...prev.env, newEnvVar]
    }));
    
    setNewEnvVar({
      key: '',
      value: '',
      description: '',
      required: false
    });
  };

  const removeEnvVar = (index: number) => {
    setFormData(prev => ({
      ...prev,
      env: prev.env.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await appsApi.createApp(formData, token);
      
      setSuccess('App created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: 'other',
        logo: '',
        deploymentType: 'docker',
        dockerImage: '',
        defaultPort: 8080,
        env: [],
        resources: {
          cpu: '1.0',
          memory: '512m'
        }
      });

      // Reload apps
      await loadApps();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create app');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this app?')) return;

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      
      await appsApi.deleteApp(slug, token);
      setSuccess('App deleted successfully!');
      await loadApps();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete app');
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin - App Management</h1>
          <p className="text-muted-foreground">
            Create and manage app templates for the marketplace
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create App Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New App</CardTitle>
              <CardDescription>Add a new app template to the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">App Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated from name</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="cms">CMS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deploymentType">Deployment Type *</Label>
                    <Select
                      value={formData.deploymentType}
                      onValueChange={(value: 'docker' | 'compose') => handleInputChange('deploymentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docker">Docker</SelectItem>
                        <SelectItem value="compose">Docker Compose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    type="url"
                    value={formData.logo}
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dockerImage">Docker Image *</Label>
                  <Input
                    id="dockerImage"
                    value={formData.dockerImage}
                    onChange={(e) => handleInputChange('dockerImage', e.target.value)}
                    placeholder="nginx:latest"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultPort">Default Port *</Label>
                  <Input
                    id="defaultPort"
                    type="number"
                    value={formData.defaultPort}
                    onChange={(e) => handleInputChange('defaultPort', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpu">CPU Limit *</Label>
                    <Input
                      id="cpu"
                      value={formData.resources.cpu}
                      onChange={(e) => handleResourceChange('cpu', e.target.value)}
                      placeholder="1.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memory">Memory Limit *</Label>
                    <Input
                      id="memory"
                      value={formData.resources.memory}
                      onChange={(e) => handleResourceChange('memory', e.target.value)}
                      placeholder="512m"
                      required
                    />
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="space-y-3">
                  <Label>Environment Variables</Label>
                  
                  {formData.env.map((env, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{env.key}</div>
                        <div className="text-xs text-muted-foreground">{env.description}</div>
                      </div>
                      {env.required && <Badge variant="outline">Required</Badge>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEnvVar(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Key"
                      value={newEnvVar.key}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                    />
                    <Input
                      placeholder="Default value"
                      value={newEnvVar.value}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Description"
                    value={newEnvVar.description}
                    onChange={(e) => setNewEnvVar({ ...newEnvVar, description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={newEnvVar.required}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, required: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="required" className="cursor-pointer">Required</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEnvVar}
                      className="ml-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variable
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create App
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Apps List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Existing Apps</CardTitle>
                <CardDescription>Manage existing app templates</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : apps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No apps yet</p>
                ) : (
                  <div className="space-y-3">
                    {apps.map(app => (
                      <div key={app._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-muted-foreground">{app.slug}</div>
                          <Badge variant="outline" className="mt-1">{app.category}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(app.slug)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthLayout>
  );
}

export default AdminApps;
