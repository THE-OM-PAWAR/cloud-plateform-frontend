import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { healthApi } from "@/services/health";

const ConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const health = await healthApi.checkHealth();
      setHealthData(health);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      setIsConnected(false);
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected === true ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : isConnected === false ? (
            <WifiOff className="h-5 w-5 text-red-500" />
          ) : (
            <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
          )}
          Backend Connection
        </CardTitle>
        <CardDescription>
          Test connection to backend API via proxy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {isConnected === true && (
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          )}
          {isConnected === false && (
            <Badge variant="destructive">Disconnected</Badge>
          )}
          {isConnected === null && (
            <Badge variant="secondary">Testing...</Badge>
          )}
        </div>

        {healthData && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Message:</span>
              <span className="font-mono">{healthData.message}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-mono">{Math.round(healthData.uptime)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-mono text-xs">
                {new Date(healthData.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button
          onClick={testConnection}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;