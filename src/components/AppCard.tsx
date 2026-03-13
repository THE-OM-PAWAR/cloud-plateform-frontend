import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Cpu, HardDrive } from 'lucide-react';
import type { App } from '@/services/appsApi';

interface AppCardProps {
  app: App;
  onDeploy: (app: App) => void;
  isDeploying?: boolean;
}

const categoryColors: Record<string, string> = {
  automation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ai: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  database: 'bg-green-500/10 text-green-500 border-green-500/20',
  analytics: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  cms: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function AppCard({ app, onDeploy, isDeploying = false }: AppCardProps) {
  const categoryColor = categoryColors[app.category] || categoryColors.other;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {app.logo ? (
              <img 
                src={app.logo} 
                alt={app.name} 
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{app.name}</CardTitle>
              <Badge variant="outline" className={`mt-1 ${categoryColor}`}>
                {app.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <CardDescription className="line-clamp-3 text-sm">
          {app.description}
        </CardDescription>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>{app.resources.cpu} CPU</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>{app.resources.memory}</span>
          </div>
        </div>

        {app.deployCount > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {app.deployCount} deployment{app.deployCount !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onDeploy(app)} 
          disabled={isDeploying}
          className="w-full"
        >
          {isDeploying ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Deploy
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
