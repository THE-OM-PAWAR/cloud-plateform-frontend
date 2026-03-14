import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon } from 'lucide-react';
import type { ReviewProgress } from '@/services/reviewer';

interface ReviewTerminalProps {
  logs: ReviewProgress[];
  title?: string;
}

export const ReviewTerminal = ({ logs, title = 'Review Terminal' }: ReviewTerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLogIcon = (message: string) => {
    if (message.includes('✅') || message.includes('success')) return '✅';
    if (message.includes('❌') || message.includes('error')) return '❌';
    if (message.includes('🔍')) return '🔍';
    if (message.includes('🤖')) return '🤖';
    if (message.includes('📦')) return '📦';
    if (message.includes('🎉')) return '🎉';
    return '>';
  };

  return (
    <Card className="h-full flex flex-col bg-slate-950 border-slate-800">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <TerminalIcon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-200">{title}</span>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-slate-500">Waiting for review to start...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.type)} flex items-start gap-2`}>
                <span className="shrink-0">{getLogIcon(log.message)}</span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
