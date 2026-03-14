import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, CheckCircle2, XCircle, Info } from 'lucide-react';
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

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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
    <Card>
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
        <div className="rounded-lg bg-black p-4 font-mono text-sm h-[400px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Waiting for deployment to start...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-2',
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
        </div>
      </CardContent>
    </Card>
  );
};
