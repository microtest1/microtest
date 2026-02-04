import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, CheckCircle2, Clock, ChevronRight, Microscope, AlertTriangle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Test, SeverityLevel } from '@/types/database';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['tests-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Test[];
    },
    enabled: !!user?.id,
  });

  const getSeverityConfig = (severity: SeverityLevel | null) => {
    switch (severity) {
      case 'severe':
        return { 
          color: 'bg-destructive text-destructive-foreground',
          icon: XCircle,
          label: 'Severe'
        };
      case 'moderate':
        return { 
          color: 'bg-warning text-warning-foreground',
          icon: AlertTriangle,
          label: 'Moderate'
        };
      case 'mild':
        return { 
          color: 'bg-accent text-accent-foreground',
          icon: Activity,
          label: 'Mild'
        };
      case 'negative':
        return { 
          color: 'bg-success text-success-foreground',
          icon: CheckCircle2,
          label: 'Negative'
        };
      default:
        return { 
          color: 'bg-muted text-muted-foreground',
          icon: Clock,
          label: 'Pending'
        };
    }
  };

  // Group tests by date
  const groupedTests = tests.reduce((groups, test) => {
    const date = format(new Date(test.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(test);
    return groups;
  }, {} as Record<string, Test[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Screening History
          </h1>
          <p className="text-muted-foreground mt-1">
            View all your malaria screening results
          </p>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Microscope className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No screenings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first malaria screening to see results here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTests).map(([date, dateTests]) => (
              <div key={date} className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground px-1">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h2>
                <div className="space-y-3">
                  {dateTests.map((test) => {
                    const severityConfig = getSeverityConfig(test.severity);
                    const SeverityIcon = severityConfig.icon;
                    
                    return (
                      <Card 
                        key={test.id} 
                        className="glass-card hover:shadow-elevated hover:scale-[1.01] transition-all cursor-pointer group"
                        onClick={() => navigate(`/results/${test.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Microscope className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">Malaria Screening</h3>
                                {test.parasite_species && (
                                  <Badge variant="outline" className="text-xs">
                                    {test.parasite_species}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(test.created_at), 'h:mm a')}
                                {test.parasite_density && (
                                  <span className="ml-2">• Density: {test.parasite_density}</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {test.confidence_score && (
                                <span className="text-sm font-medium text-muted-foreground">
                                  {Math.round(test.confidence_score)}%
                                </span>
                              )}
                              <Badge className={severityConfig.color}>
                                <SeverityIcon className="h-3 w-3 mr-1" />
                                {severityConfig.label}
                              </Badge>
                              {test.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : (
                                <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
                              )}
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
