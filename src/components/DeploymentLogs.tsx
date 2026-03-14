import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, CheckCircle2, XCircle, Info, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface DeploymentLogsProps {
  logs: LogEntry[];
  status?: 'deploying' | 'deployed' | 'failed';
}

export const DeploymentLogs = ({ logs, status }: DeploymentLogsProps) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (!isUserScrolling && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [logs, isUserScrolling]);

  // Detect user scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
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

  const scrollToBottom = () => {
    setIsUserScrolling(false);
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'deploying':
        return (
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-500 font-medium">Deploying...</span>
          </div>
        );
      case 'deployed':
        return (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-500 font-medium">Deployed</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500 font-medium">Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <CardTitle>Deployment Logs</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollContainerRef}
          className="rounded-lg bg-black p-4 font-mono text-sm h-[400px] overflow-y-auto relative"
        >
          {logs.length === 0 ? (
            <div className="text-gray-500">Waiting for deployment to start...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-2 animate-fade-in',
                    log.type === 'error' && 'text-red-400',
                    log.type === 'success' && 'text-green-400',
                    log.type === 'info' && 'text-gray-300'
                  )}
                >
                  <span className="shrink-0 mt-0.5">{getIcon(log.type)}</span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
          
          {/* Jump to Latest Button */}
          {showJumpButton && logs.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 shadow-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
              Jump to Latest
            </Button>
          )}
        </div>
      </CardContent>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </Card>
  );
};
