import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight,
  Zap,
  Shield,
  GitBranch
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GitHubIntegrationAnimationProps {
  status: 'connecting' | 'success' | 'error';
  onComplete?: () => void;
}

export const GitHubIntegrationAnimation = ({ status, onComplete }: GitHubIntegrationAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { 
      icon: Github, 
      title: 'Connecting to GitHub', 
      description: 'Establishing secure connection...',
      color: 'text-blue-500'
    },
    { 
      icon: Shield, 
      title: 'Authenticating', 
      description: 'Verifying your credentials...',
      color: 'text-yellow-500'
    },
    { 
      icon: GitBranch, 
      title: 'Syncing Repositories', 
      description: 'Fetching your repositories...',
      color: 'text-purple-500'
    },
    { 
      icon: Zap, 
      title: 'Finalizing Setup', 
      description: 'Preparing your workspace...',
      color: 'text-green-500'
    }
  ];

  useEffect(() => {
    if (status === 'connecting') {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [status, steps.length]);

  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard/integrations');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Github className="h-6 w-6" />
                GitHub Integration
              </div>
              <p className="text-sm text-muted-foreground">
                {status === 'connecting' && 'Setting up your GitHub connection...'}
                {status === 'success' && 'Successfully connected to GitHub!'}
                {status === 'error' && 'Connection failed. Please try again.'}
              </p>
            </div>

            {/* Animation Content */}
            <div className="space-y-6">
              {status === 'connecting' && (
                <div className="space-y-4">
                  {/* Progress Steps */}
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStep;
                      const isCompleted = index < currentStep;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: isActive ? 1 : 0.3,
                            x: 0,
                            scale: isActive ? 1 : 0.95
                          }}
                          transition={{ delay: index * 0.2 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isActive ? 'bg-muted/50 border-border' : 'border-transparent'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isActive ? 'bg-primary text-primary-foreground' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isActive ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.description}
                            </div>
                          </div>
                          {isActive && !isCompleted && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-4 w-4 text-primary" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-semibold text-green-600">Connection Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your GitHub account has been successfully connected. You can now deploy repositories with one click.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <span>Ready to deploy</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                      className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <XCircle className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-semibold text-red-600">Connection Failed</h3>
                    <p className="text-sm text-muted-foreground">
                      We couldn't connect your GitHub account. Please try again or check your permissions.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {status === 'success' && (
                <Button onClick={handleContinue} className="w-full">
                  Continue to Dashboard
                </Button>
              )}
              
              {status === 'error' && (
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    Try Again
                  </Button>
                  <Button onClick={handleContinue} variant="outline" className="w-full">
                    Back to Integrations
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};