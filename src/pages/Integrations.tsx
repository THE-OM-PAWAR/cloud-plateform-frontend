import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { GitHubConnection } from '@/components/GitHubConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Cloud } from 'lucide-react';

export const Integrations = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Integrations</h1>
              <p className="text-muted-foreground">
                Connect external services to enhance your deployment workflow
              </p>
            </div>

            <div className="space-y-6">
              {/* GitHub Integration */}
              <GitHubConnection />

              {/* Coming Soon Integrations */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Database</CardTitle>
                        <CardDescription>Connect to PostgreSQL, MongoDB, Redis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </CardContent>
                </Card>

                <Card className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Cloud className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Cloud Storage</CardTitle>
                        <CardDescription>Connect to AWS S3, Google Cloud Storage</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Integrations;
