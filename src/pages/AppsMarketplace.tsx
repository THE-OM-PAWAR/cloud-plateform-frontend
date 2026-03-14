import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { AppCard } from '@/components/AppCard';
import { DeployDialog } from '@/components/DeployDialog';
import { AuthLayout } from '@/components/AuthLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertCircle, Package } from 'lucide-react';
import { appsApi, type App } from '@/services/appsApi';

export function AppsMarketplace() {
  const { getToken } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchQuery, categoryFilter]);

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await appsApi.getMarketplaceApps(token || undefined);
      setApps(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    let filtered = apps;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(app => app.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
      );
    }

    setFilteredApps(filtered);
  };

  const handleDeploy = (app: App) => {
    setSelectedApp(app);
    setDeployDialogOpen(true);
  };

  const handleDeploySubmit = async (projectName: string, envVars: Record<string, string>) => {
    if (!selectedApp) return;
    
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    await appsApi.deployApp(selectedApp.slug, { projectName, envVars }, token);
  };

  const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];

  return (
    <AuthLayout>
      <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">App Marketplace</h1>
          <p className="text-muted-foreground">
            Deploy pre-configured applications with one click
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && filteredApps.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No apps found</h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No apps available in the marketplace'}
            </p>
          </div>
        )}

        {/* Apps Grid */}
        {!loading && !error && filteredApps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <AppCard
                key={app._id}
                app={app}
                onDeploy={handleDeploy}
              />
            ))}
          </div>
        )}

        {/* Deploy Dialog */}
        <DeployDialog
          app={selectedApp}
          open={deployDialogOpen}
          onClose={() => {
            setDeployDialogOpen(false);
            setSelectedApp(null);
          }}
          onDeploy={handleDeploySubmit}
        />
      </AuthLayout>
  );
}

export default AppsMarketplace;
