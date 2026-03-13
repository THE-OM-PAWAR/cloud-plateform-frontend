import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Home, Terminal } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-4">404</CardTitle>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button 
            onClick={() => navigate("/dashboard")} 
            variant="outline"
            className="w-full"
          >
            <Terminal className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;