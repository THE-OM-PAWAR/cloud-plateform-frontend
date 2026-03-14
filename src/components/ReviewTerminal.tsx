import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Terminal as TerminalIcon, Loader2, ExternalLink, GitPullRequest, FileCode, ArrowDown } from 'lucide-react';
import type { ReviewProgress } from '@/services/reviewer';

interface ReviewTerminalProps {
  logs: ReviewProgress[];
  title?: string;
  isProcessing?: boolean;
  showSuccessActions?: boolean;
  onViewCode?: () => void;
  onCreatePR?: () => void;
  repoUrl?: string;
}

export const ReviewTerminal = ({ 
  logs, 
  title = 'Review Terminal', 
  isProcessing = false,
  showSuccessActions = false,
  onViewCode,
  onCreatePR,
  repoUrl
}: ReviewTerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [visibleLogs, setVisibleLogs] = useState<ReviewProgress[]>([]);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (!isUserScrolling && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [visibleLogs, isUserScrolling]);

  // Detect user scrolling
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setShowJumpButton(!isAtBottom);
      
      // If user scrolls to bottom, resume auto-scroll
      if (isAtBottom) {
        setIsUserScrolling(false);
      } else {
        setIsUserScrolling(true);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate logs appearing one by one
  useEffect(() => {
    if (logs.length > visibleLogs.length) {
      const timer = setTimeout(() => {
        setVisibleLogs(logs.slice(0, visibleLogs.length + 1));
      }, 100);
      return () => clearTimeout(timer);
    } else if (logs.length < visibleLogs.length) {
      setVisibleLogs(logs);
    }
  }, [logs, visibleLogs.length]);

  const scrollToBottom = () => {
    setIsUserScrolling(false);
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-emerald-300';
    }
  };

  const getLogIcon = (message: string) => {
    if (message.includes('✅') || message.includes('success')) return '✅';
    if (message.includes('❌') || message.includes('error')) return '❌';
    if (message.includes('🔍')) return '🔍';
    if (message.includes('🤖')) return '🤖';
    if (message.includes('📦')) return '📦';
    if (message.includes('🎉')) return '🎉';
    if (message.includes('🧠')) return '🧠';
    if (message.includes('⚙️')) return '⚙️';
    if (message.includes('✏️')) return '✏️';
    if (message.includes('🔧')) return '🔧';
    if (message.includes('🏗️')) return '🏗️';
    return '>';
  };

  const hasSuccessLog = visibleLogs.some(log => 
    log.message.includes('Error Resolved Successfully') || 
    log.message.includes('Fix successfully applied')
  );

  return (
    <Card className="h-full flex flex-col bg-zinc-950 border-zinc-800 shadow-lg shadow-emerald-500/5 relative">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-zinc-200">{title}</span>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI Fixing...</span>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2 font-mono text-sm">
          {visibleLogs.length === 0 ? (
            <div className="text-zinc-500 flex items-center gap-2">
              <span className="animate-pulse">▊</span>
              <span>Waiting for process to start...</span>
            </div>
          ) : (
            <>
              {visibleLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${getLogColor(log.type)} flex items-start gap-2 animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                  }}
                >
                  <span className="shrink-0">{getLogIcon(log.message)}</span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
              
              {/* Success Actions */}
              {hasSuccessLog && showSuccessActions && (
                <div className="mt-6 pt-4 border-t border-zinc-800 animate-fade-in-up" style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}>
                  <div className="flex flex-wrap gap-2 not-mono">
                    {repoUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
                        onClick={() => window.open(repoUrl, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View Updated Code
                      </Button>
                    )}
                    {onViewCode && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
                        onClick={onViewCode}
                      >
                        <FileCode className="h-3.5 w-3.5 mr-1.5" />
                        View Changes
                      </Button>
                    )}
                    {onCreatePR && (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={onCreatePR}
                      >
                        <GitPullRequest className="h-3.5 w-3.5 mr-1.5" />
                        Create Pull Request
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Blinking cursor */}
              {!hasSuccessLog && (
                <div className="flex items-center gap-2 text-emerald-400 mt-2">
                  <span className="animate-pulse">▊</span>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={logsEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Jump to Latest Button */}
      {showJumpButton && visibleLogs.length > 0 && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
          Jump to Latest
        </Button>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .not-mono {
          font-family: inherit;
        }
      `}</style>
    </Card>
  );
};
