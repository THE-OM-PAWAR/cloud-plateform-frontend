import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Sparkles } from 'lucide-react';

interface ReviewChatProps {
  summary?: string;
  recommendations?: string;
}

export const ReviewChat = ({ summary, recommendations }: ReviewChatProps) => {
  if (!summary && !recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Review Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI summary will appear here after the review completes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Review Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4 text-sm">
            {summary && (
              <div className="whitespace-pre-wrap">{summary}</div>
            )}
            {recommendations && (
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {recommendations}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
