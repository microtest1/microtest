import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { 
  Activity, 
  FileText, 
  Clock, 
  Microscope, 
  ArrowRight, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
} from "lucide-react";
import type { Test, SeverityLevel } from "@/types/database";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: tests, isLoading } = useQuery({
    queryKey: ['user-tests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Test[];
    },
    enabled: !!user?.id,
  });

  const totalTests = tests?.length || 0;
  const completedTests = tests?.filter(t => t.status === 'completed')?.length || 0;
  const positiveTests = tests?.filter(t => t.severity && t.severity !== 'negative')?.length || 0;
  const negativeTests = tests?.filter(t => t.severity === 'negative')?.length || 0;

  const getSeverityBadge = (severity: SeverityLevel | null) => {
    switch (severity) {
      case 'severe':
      case 'moderate':
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            Detected
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Not Detected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            Start a new malaria screening or view your recent results
          </p>
        </div>

        {/* Quick Action Card */}
        <Card className="bg-primary border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Microscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Start Malaria Screening</h3>
                  <p className="text-sm text-white/70">Capture a blood smear image for AI analysis</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/scanner")}
                className="bg-white text-primary hover:bg-white/90"
              >
                Start Screening
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{totalTests}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total Screenings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{negativeTests}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Negative Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{positiveTests}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Positive Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Screenings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Screenings</CardTitle>
            {tests && tests.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/history')}
                className="text-primary"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : tests && tests.length > 0 ? (
              <div className="space-y-2">
                {tests.map((test) => (
                  <div 
                    key={test.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/results/${test.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Microscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Malaria Screening</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(test.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(test.severity)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Microscope className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">No screenings yet</p>
                <Button 
                  variant="link" 
                  className="text-primary"
                  onClick={() => navigate('/scanner')}
                >
                  Start your first screening
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">About Microtest Screening</p>
              <p className="text-sm text-muted-foreground">
                Microtest uses AI to assist with preliminary malaria screening. 
                Results are for screening purposes only and should be confirmed with laboratory diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
