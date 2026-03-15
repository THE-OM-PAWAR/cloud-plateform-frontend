import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function CliAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus('error');
      setMessage('Please sign in to continue');
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        navigate('/sign-in?redirect=/cli-auth?' + searchParams.toString());
      }, 2000);
      return;
    }

    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid session. Missing session ID.');
      return;
    }

    completeAuth(sessionId);
  }, [isLoaded, isSignedIn, searchParams, navigate]);

  const completeAuth = async (sessionId: string) => {
    try {
      setStatus('loading');
      setMessage('Authenticating your CLI...');

      const clerkToken = await getToken();
      
      if (!clerkToken) {
        throw new Error('Failed to get authentication token');
      }

      // Get API URL and ensure it doesn't have /api suffix
      let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Remove /api suffix if present
      if (apiUrl.endsWith('/api')) {
        apiUrl = apiUrl.slice(0, -4);
      }
      
      await axios.post(
        `${apiUrl}/api/cli/auth/complete`,
        { sessionId },
        { 
          headers: { 
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setStatus('success');
      setMessage('CLI authentication successful! You can return to your terminal.');
    } catch (error: any) {
      console.error('CLI auth error:', error);
      setStatus('error');
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage('Authentication failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Terminal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">CloudOne CLI Authentication</CardTitle>
          <CardDescription>
            Authenticating your command-line interface
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-lg text-gray-700 dark:text-gray-300">{message}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please wait while we authenticate your CLI...
              </p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                    {message}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Next steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>Return to your terminal</li>
                      <li>The CLI will automatically detect authentication</li>
                      <li>Start using CloudOne CLI commands</li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    You can safely close this window
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-red-800 dark:text-red-300">
                    Authentication Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {message}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      What to do:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>Return to your terminal</li>
                      <li>Run <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cloudone login</code> again</li>
                      <li>Make sure you're signed in to CloudOne</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              CloudOne CLI • Secure Authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
