import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Terminal, Cloud, Zap, Shield } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CloudTerminal</h1>
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Cloud Terminal Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access your remote servers securely through our web-based terminal. 
            Manage your infrastructure from anywhere with enterprise-grade security.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/dashboard")}
              className="px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/bash")}
              className="px-8"
            >
              <Terminal className="mr-2 h-4 w-4" />
              Quick Terminal
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Terminal className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Web Terminal</CardTitle>
              <CardDescription>
                Full-featured terminal in your browser with SSH connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Real-time terminal sessions</li>
                <li>• Multiple server connections</li>
                <li>• Custom themes and fonts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>High Performance</CardTitle>
              <CardDescription>
                Lightning-fast connections with minimal latency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• WebSocket connections</li>
                <li>• Optimized data transfer</li>
                <li>• Auto-reconnection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure Access</CardTitle>
              <CardDescription>
                Enterprise-grade security for your server connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• SSH key authentication</li>
                <li>• Encrypted connections</li>
                <li>• Session management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription>
                Access your dashboard to manage servers and terminal sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-12"
              >
                Open Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 CloudTerminal. Built with React and modern web technologies.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;