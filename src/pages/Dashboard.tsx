import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  XCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Target,
  Shield,
  Zap
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
  const pendingTests = tests?.filter(t => t.status === 'processing')?.length || 0;
  const completedTests = tests?.filter(t => t.status === 'completed')?.length || 0;
  const positiveTests = tests?.filter(t => t.severity && t.severity !== 'negative')?.length || 0;

  const getSeverityConfig = (severity: SeverityLevel | null) => {
    switch (severity) {
      case 'severe':
        return { color: 'bg-destructive', textColor: 'text-destructive', icon: XCircle, label: 'Severe' };
      case 'moderate':
        return { color: 'bg-warning', textColor: 'text-warning', icon: AlertTriangle, label: 'Moderate' };
      case 'mild':
        return { color: 'bg-accent', textColor: 'text-accent', icon: Activity, label: 'Mild' };
      case 'negative':
        return { color: 'bg-success', textColor: 'text-success', icon: CheckCircle2, label: 'Negative' };
      default:
        return { color: 'bg-muted', textColor: 'text-muted-foreground', icon: Clock, label: 'Pending' };
    }
  };

  const stats = [
    { 
      label: "Total Screenings", 
      value: totalTests.toString(), 
      icon: Activity,
      color: "primary",
      bgColor: "bg-primary/10"
    },
    { 
      label: "Processing", 
      value: pendingTests.toString(), 
      icon: Clock,
      color: "warning",
      bgColor: "bg-warning/10"
    },
    { 
      label: "Completed", 
      value: completedTests.toString(), 
      icon: CheckCircle2,
      color: "success",
      bgColor: "bg-success/10"
    },
    { 
      label: "Positive Cases", 
      value: positiveTests.toString(), 
      icon: AlertTriangle,
      color: "destructive",
      bgColor: "bg-destructive/10"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-1">Your malaria screening dashboard</p>
          </div>
          <Button
            size="lg"
            className="btn-premium shadow-lg shadow-primary/25 bg-destructive hover:bg-destructive/90"
            onClick={() => navigate("/scanner")}
          >
            <Microscope className="h-5 w-5 mr-2" />
            New Screening
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Malaria Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <Target className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">Parasite Detection</p>
              <p className="text-xs text-muted-foreground">P. falciparum, P. vivax, P. ovale, P. malariae</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <Zap className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Fast Analysis</p>
              <p className="text-xs text-muted-foreground">Results in under 60 seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
            <Shield className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">WHO Guidelines</p>
              <p className="text-xs text-muted-foreground">Evidence-based recommendations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    )}
                  </div>
                  <div className={`rounded-xl ${stat.bgColor} p-4`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Action */}
        <div>
          <h2 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <button
            onClick={() => navigate('/scanner')}
            className="w-full glass-card rounded-2xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive group-hover:shadow-lg transition-all">
                  <Microscope className="h-7 w-7 text-destructive group-hover:text-destructive-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold font-display text-foreground">Malaria Blood Smear Analysis</h3>
                  <p className="text-sm text-muted-foreground">Capture and analyze blood smear for Plasmodium parasites</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Recent Tests */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display">
                <FileText className="h-5 w-5 text-primary" />
                Recent Screenings
              </CardTitle>
              {tests && tests.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : tests && tests.length > 0 ? (
              <div className="divide-y divide-border/50">
                {tests.map((test) => {
                  const severityConfig = getSeverityConfig(test.severity);
                  const SeverityIcon = severityConfig.icon;
                  
                  return (
                    <button
                      key={test.id}
                      onClick={() => navigate(`/results/${test.id}`)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <Microscope className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          Malaria Screening
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(test.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {test.confidence_score && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {Math.round(test.confidence_score)}%
                          </span>
                        )}
                        <Badge className={`${severityConfig.color} text-white`}>
                          <SeverityIcon className="h-3 w-3 mr-1" />
                          {severityConfig.label}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No screenings yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Start your first AI-powered malaria screening
                </p>
                <Button onClick={() => navigate('/scanner')} className="bg-destructive hover:bg-destructive/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Screening
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AI-Powered</p>
              <p className="text-sm text-muted-foreground">Deep learning detection</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">&lt;60s Analysis</p>
              <p className="text-sm text-muted-foreground">Rapid screening results</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">PDF Reports</p>
              <p className="text-sm text-muted-foreground">Professional exports</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
