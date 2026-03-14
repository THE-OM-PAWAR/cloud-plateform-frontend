import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Code2, FileCode } from 'lucide-react';
import type { Review } from '@/services/reviewer';

interface ReviewSummaryProps {
  review: Review | null;
  progress?: number;
}

export const ReviewSummary = ({ review, progress = 0 }: ReviewSummaryProps) => {
  if (!review) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start a review to see the summary
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'analyzing':
      case 'scanning':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Repository Info</span>
            <Badge className={getStatusColor(review.status)}>
              {review.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Repository</div>
            <div className="text-sm text-muted-foreground">
              {review.repoOwner}/{review.repoName}
            </div>
          </div>

          {review.techStack && (
            <div>
              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Tech Stack
              </div>
              <Badge variant="secondary">{review.techStack}</Badge>
            </div>
          )}

          {review.language && (
            <div>
              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Language
              </div>
              <Badge variant="outline">{review.language}</Badge>
            </div>
          )}

          {review.status !== 'completed' && review.status !== 'failed' && (
            <div>
              <div className="text-sm font-medium mb-2">Progress</div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {review.issues && review.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Issues Found ({review.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {review.issues.slice(0, 5).map((issue, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0">•</span>
                  <span>{issue}</span>
                </li>
              ))}
              {review.issues.length > 5 && (
                <li className="text-sm text-muted-foreground">
                  +{review.issues.length - 5} more issues
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {review.filesGenerated && review.filesGenerated.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Files Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {review.filesGenerated.map((file, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{file.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
