import type { Repository } from '@/services/github';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Lock, Unlock, Rocket } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RepoCardProps {
  repo: Repository;
  onDeploy: (repo: Repository) => void;
}

export const RepoCard = ({ repo, onDeploy }: RepoCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{repo.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {repo.description || 'No description'}
            </CardDescription>
          </div>
          {repo.private ? (
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <Unlock className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
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
          onClick={() => onDeploy(repo)} 
          className="w-full"
          size="sm"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </CardContent>
    </Card>
  );
};
