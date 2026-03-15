import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Terminal, 
  Copy,
  CheckCircle,
  Download,
  LogIn,
  FolderOpen,
  Search,
  Rocket,
  List
} from 'lucide-react';
import { toast } from 'sonner';

export const CliDocumentation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const CommandBlock = ({ command }: { command: string }) => (
    <div className="relative group">
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 font-mono text-sm">
        <code className="text-foreground">{command}</code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(command)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">CloudOne CLI</h1>
                  <p className="text-muted-foreground">Deploy and manage applications from terminal</p>
                </div>
              </div>
              
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                v1.0.0
              </Badge>
            </div>

            <div className="space-y-8">
              {/* Install */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-5 w-5" />
                    Install
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommandBlock command="npm install -g cloudone-cli" />
                  <CommandBlock command="cloudone --version" />
                </CardContent>
              </Card>

              {/* Auth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LogIn className="h-5 w-5" />
                    Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommandBlock command="cloudone login" />
                  <CommandBlock command="cloudone auth:token <YOUR_TOKEN>" />
                  <CommandBlock command="cloudone logout" />
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommandBlock command="cloudone repositories" />
                  <CommandBlock command="cloudone init" />
                </CardContent>
              </Card>

              {/* Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="h-5 w-5" />
                    Code Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommandBlock command="cloudone start-review" />
                  <CommandBlock command="cloudone start-review --repo username/repo" />
                  <CommandBlock command="cloudone code-fix" />
                  <CommandBlock command="cloudone code-fix --review <review-id>" />
                </CardContent>
              </Card>

              {/* Deploy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Rocket className="h-5 w-5" />
                    Deploy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CommandBlock command="cloudone deploy" />
                  <CommandBlock command="cloudone deploy --subdomain myapp" />
                  <CommandBlock command="cloudone deploy --repo username/repo" />
                  <CommandBlock command="cloudone deployments" />
                </CardContent>
              </Card>

              {/* Quick Workflow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <List className="h-5 w-5" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                      <CommandBlock command="cloudone login" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                      <CommandBlock command="cloudone auth:token <token>" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
                      <CommandBlock command="cloudone deploy --subdomain myapp" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Common Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Authentication failed:</p>
                    <div className="space-y-2">
                      <CommandBlock command="cloudone logout" />
                      <CommandBlock command="cloudone login" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Git not found:</p>
                    <div className="space-y-2">
                      <CommandBlock command="git --version" />
                      <CommandBlock command="git remote -v" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Deployment stuck:</p>
                    <div className="space-y-2">
                      <CommandBlock command="cloudone deployments" />
                      <CommandBlock command="cloudone deploy --subdomain different-name" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CliDocumentation;