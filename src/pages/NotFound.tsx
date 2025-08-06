import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl mb-4">🔧</div>
          <CardTitle className="text-2xl">页面未找到</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移动。
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="default">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
