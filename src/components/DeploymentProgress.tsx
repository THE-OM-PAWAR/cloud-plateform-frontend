import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface DeploymentLog {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'step';
  timestamp: string;
}

interface DeploymentStep {
  step: number;
  total: number;
  name: string;
  description: string;
  progress: number;
}

interface DeploymentProgressProps {
  deploymentId: string | null;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}

export const DeploymentProgress: React.FC<DeploymentProgressProps> = ({
  deploymentId,
  onComplete,
  onError
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [currentStep, setCurrentStep] = useState<DeploymentStep | null>(null);
  const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!deploymentId) return;

    console.log('🔌 Connecting to deployment server for ID:', deploymentId);
    
    // Use relative URL to leverage Vite proxy
    const socketUrl = import.meta.env.DEV ? '' : window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to deployment server, socket ID:', newSocket.id);
      setStatus('deploying');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from deployment server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    newSocket.on(`deployment:${deploymentId}`, (data) => {
      console.log('📨 Received deployment event:', data);
      const { event, data: eventData, timestamp } = data;

      switch (event) {
        case 'start':
          console.log('🚀 Deployment started');
          setStatus('deploying');
          setLogs([{
            message: '🚀 Deployment started...',
            type: 'info',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'log':
          console.log('📝 Log entry:', eventData);
          setLogs(prev => [...prev, {
            message: eventData.message || eventData,
            type: eventData.type || 'info',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'step':
          console.log('👣 Step update:', eventData);
          setCurrentStep(eventData);
          setLogs(prev => [...prev, {
            message: `📍 ${eventData.name}: ${eventData.description}`,
            type: 'step',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'success':
          console.log('✅ Success event:', eventData);
          setLogs(prev => [...prev, {
            message: eventData.message || '✅ Step completed successfully',
            type: 'success',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'error':
          console.log('❌ Error event:', eventData);
          setStatus('error');
          setError(eventData);
          setLogs(prev => [...prev, {
            message: eventData.message || 'An error occurred',
            type: 'error',
            timestamp: timestamp || new Date().toISOString()
          }]);
          onError?.(eventData);
          break;

        case 'warning':
          console.log('⚠️ Warning event:', eventData);
          setLogs(prev => [...prev, {
            message: eventData.message || eventData,
            type: 'warning',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'info':
          console.log('ℹ️ Info event:', eventData);
          setLogs(prev => [...prev, {
            message: eventData.message || eventData,
            type: 'info',
            timestamp: timestamp || new Date().toISOString()
          }]);
          break;

        case 'complete':
          console.log('🎉 Deployment complete:', eventData);
          setStatus('success');
          setResult(eventData.result || eventData);
          setLogs(prev => [...prev, {
            message: '🎉 Deployment completed successfully!',
            type: 'success',
            timestamp: timestamp || new Date().toISOString()
          }]);
          onComplete?.(eventData.result || eventData);
          break;

        default:
          console.log('❓ Unknown event:', event, eventData);
          setLogs(prev => [...prev, {
            message: `${event}: ${JSON.stringify(eventData)}`,
            type: 'info',
            timestamp: timestamp || new Date().toISOString()
          }]);
      }
    });

    return () => {
      console.log('🔌 Disconnecting from deployment server');
      newSocket.disconnect();
    };
  }, [deploymentId, onComplete, onError]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'step':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'deploying':
        return <Badge variant="default" className="bg-blue-500">Deploying</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  if (!deploymentId) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Deployment Progress</CardTitle>
            {getStatusBadge()}
          </div>
          {currentStep && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentStep.name}</span>
                <span className="text-muted-foreground">
                  Step {currentStep.step} of {currentStep.total}
                </span>
              </div>
              <Progress value={currentStep.progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Success Result */}
      {status === 'success' && result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Deployment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Project:</strong> {result.projectName}
              </p>
              <p className="text-sm">
                <strong>URL:</strong>{' '}
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {result.url}
                </a>
              </p>
              <p className="text-sm">
                <strong>Port:</strong> {result.port}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {status === 'error' && error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Deployment Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-red-700">{error.message}</p>
              {error.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-red-600">Show Details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deployment Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={`${index}-${log.timestamp}`} className="flex items-start gap-2 text-sm font-mono">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <span className={`block break-words ${
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'success' ? 'text-green-600' :
                      log.type === 'warning' ? 'text-yellow-600' :
                      log.type === 'step' ? 'text-blue-600 font-medium' :
                      'text-gray-700 dark:text-gray-300'
                    }`}>
                      {log.message}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  {status === 'deploying' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Waiting for deployment logs...
                    </span>
                  ) : (
                    'Deployment logs will appear here...'
                  )}
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};