import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ReviewTerminal } from '@/components/ReviewTerminal';
import { ReviewSummary } from '@/components/ReviewSummary';
import { ReviewChat } from '@/components/ReviewChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Wrench, ExternalLink, Rocket, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewerApi, type Review, type ReviewProgress } from '@/services/reviewer';
import { projectsApi } from '@/services/projects';
import { io, Socket } from 'socket.io-client';

export const ReviewWorkspace = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [logs, setLogs] = useState<ReviewProgress[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const startReview = async () => {
    if (!owner || !repo) return;

    try {
      setReviewing(true);
      setLogs([]);
      setProgress(0);
      setShowSuccess(false);

      const token = await getToken();
      if (!token) return;

      // Connect to Socket.IO
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const newSocket = io(API_URL.replace('/api', ''));
      setSocket(newSocket);

      newSocket.on('connect', async () => {
        console.log('Socket connected:', newSocket.id);

        // Listen for review progress
        newSocket.on('review:progress', (data: ReviewProgress) => {
          setLogs(prev => [...prev, data]);
          
          // Update progress based on messages
          if (data.message.includes('Scanning')) setProgress(20);
          if (data.message.includes('Detecting')) setProgress(40);
          if (data.message.includes('Loading')) setProgress(60);
          if (data.message.includes('AI')) setProgress(80);
          if (data.message.includes('completed')) setProgress(100);
        });

        newSocket.on('review:error', (data: any) => {
          setLogs(prev => [...prev, {
            message: data.message,
            type: 'error',
            timestamp: new Date().toISOString()
          }]);
          toast.error('Review failed');
          setReviewing(false);
        });

        // Start review
        const response = await reviewerApi.startReview(token, owner, repo, newSocket.id);
        toast.success('Review started!');

        // Poll for review completion
        const pollInterval = setInterval(async () => {
          try {
            const reviews = await reviewerApi.getReviews(token);
            const latestReview = reviews.find(r => 
              r.repoOwner === owner && r.repoName === repo
            );
            
            if (latestReview && (latestReview.status === 'completed' || latestReview.status === 'failed')) {
              setReview(latestReview);
              setReviewing(false);
              setProgress(100);
              clearInterval(pollInterval);
              
              if (latestReview.status === 'completed') {
                toast.success('Review completed!');
              }
            }
          } catch (error) {
            console.error('Error polling review:', error);
          }
        }, 3000);

        // Cleanup after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      });

    } catch (error: any) {
      console.error('Review error:', error);
      toast.error(error.response?.data?.message || 'Failed to start review');
      setReviewing(false);
    }
  };

  const handleFixRepository = async () => {
    if (!review) {
      console.error('No review object available');
      toast.error('No review available to fix');
      return;
    }

    console.log('Fix repository - review object:', review);
    console.log('Review ID:', review.id);

    if (!review.id) {
      console.error('Review object missing id property');
      toast.error('Review ID is missing');
      return;
    }

    try {
      setFixing(true);
      setLogs([]);

      const token = await getToken();
      if (!token) return;

      // Connect to Socket.IO for fix progress
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const newSocket = io(API_URL.replace('/api', ''));

      newSocket.on('connect', async () => {
        console.log('Socket connected for fix:', newSocket.id);
        console.log('Calling fixRepository with reviewId:', review.id);

        newSocket.on('review:fix-progress', (data: ReviewProgress) => {
          setLogs(prev => [...prev, data]);
        });

        newSocket.on('review:error', (data: any) => {
          setLogs(prev => [...prev, {
            message: data.message,
            type: 'error',
            timestamp: new Date().toISOString()
          }]);
          toast.error('Fix failed');
          setFixing(false);
        });

        await reviewerApi.fixRepository(token, review.id, newSocket.id);
        toast.success('Fix process started!');

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const updatedReview = await reviewerApi.getReview(token, review.id);
            
            if (updatedReview.filesGenerated && updatedReview.filesGenerated.length > 0) {
              setReview(updatedReview);
              setFixing(false);
              setShowSuccess(true);
              clearInterval(pollInterval);
              toast.success('Repository fixed successfully!');
            }
          } catch (error) {
            console.error('Error polling fix:', error);
          }
        }, 3000);

        setTimeout(() => clearInterval(pollInterval), 300000);
      });

    } catch (error: any) {
      console.error('Fix error:', error);
      toast.error(error.response?.data?.message || 'Failed to fix repository');
      setFixing(false);
    }
  };

  const handleDeploy = async () => {
    if (!review || !owner || !repo) {
      toast.error('Missing repository information');
      return;
    }

    try {
      setDeploying(true);
      setShowSuccess(false);
      setLogs([]);

      const token = await getToken();
      if (!token) return;

      // Generate subdomain from repo name
      const subdomain = repo.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Connect to Socket.IO for deployment progress
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const newSocket = io(API_URL.replace('/api', ''));
      setSocket(newSocket);

      newSocket.on('connect', async () => {
        console.log('Socket connected for deployment:', newSocket.id);

        // Listen for deployment events
        newSocket.on('deployment:progress', (logData: any) => {
          setLogs(prev => [...prev, {
            timestamp: logData.timestamp || new Date().toISOString(),
            message: logData.message,
            type: logData.type || 'info'
          }]);
        });

        newSocket.on('deployment:error', (errorData: any) => {
          setLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: errorData.message,
            type: 'error'
          }]);
          toast.error('Deployment failed');
          setDeploying(false);
        });

        // Start deployment
        await projectsApi.deploy(token, {
          repoOwner: owner,
          repoName: repo,
          branch: 'main', // You can make this configurable
          subdomain: subdomain
        }, newSocket.id);

        toast.success('Deployment started!');
        
        // Monitor deployment completion
        setTimeout(() => {
          setDeploying(false);
          toast.success('Deployment completed! Redirecting to projects...');
          setTimeout(() => {
            navigate('/dashboard/projects');
          }, 2000);
        }, 60000); // 1 minute timeout
      });

    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.response?.data?.message || 'Failed to start deployment');
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-hidden bg-background">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/reviewer')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{owner}/{repo}</h1>
                    <p className="text-sm text-muted-foreground">Code Review Workspace</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!review && !reviewing && (
                    <Button onClick={startReview}>
                      Start Review
                    </Button>
                  )}
                  
                  {review && review.status === 'completed' && !fixing && !showSuccess && (
                    <Button onClick={handleFixRepository}>
                      <Wrench className="mr-2 h-4 w-4" />
                      Fix Repository
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Success Screen */}
            {showSuccess && review?.filesGenerated && !deploying && (
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="max-w-2xl w-full">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">Review Completed!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Files Added to Repository:</h3>
                      <ul className="space-y-2">
                        {review.filesGenerated.map((file, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-mono">{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => window.open(`https://github.com/${owner}/${repo}`, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Repository
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleDeploy}
                        disabled={deploying}
                      >
                        {deploying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Deploy Project
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Deployment Progress */}
            {deploying && (
              <div className="flex-1 p-6 overflow-hidden">
                <div className="h-full">
                  <ReviewTerminal 
                    logs={logs}
                    title="Deployment Progress"
                  />
                </div>
              </div>
            )}

            {/* Workspace Layout */}
            {!showSuccess && !deploying && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 overflow-hidden">
                {/* Left Panel - Summary */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto">
                  <ReviewSummary review={review} progress={progress} />
                  <ReviewChat summary={review?.summary} recommendations={review?.recommendations} />
                </div>

                {/* Right Panel - Terminal */}
                <div className="lg:col-span-2 overflow-hidden">
                  <ReviewTerminal 
                    logs={logs}
                    title={fixing ? 'Fix Progress' : 'Review Progress'}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReviewWorkspace;
