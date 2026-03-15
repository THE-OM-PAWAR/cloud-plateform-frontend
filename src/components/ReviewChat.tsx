import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          <div className="space-y-4">
            {summary && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom components for better styling
                    h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-foreground">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                    p: ({children}) => <p className="text-sm mb-2 text-foreground leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="text-sm mb-2 pl-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="text-sm mb-2 pl-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-foreground list-disc">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                    code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground">{children}</blockquote>
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            )}
            {recommendations && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-muted-foreground">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-muted-foreground">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{children}</h3>,
                      p: ({children}) => <p className="text-sm mb-2 text-muted-foreground leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="text-sm mb-2 pl-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="text-sm mb-2 pl-4 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-muted-foreground list-disc">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-muted-foreground">{children}</strong>,
                      code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      blockquote: ({children}) => <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground">{children}</blockquote>
                    }}
                  >
                    {recommendations}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
