import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Test } from '@/types/database';

const History: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['tests-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Test[];
    },
  });

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'severe': return 'bg-destructive text-destructive-foreground';
      case 'moderate': return 'bg-warning text-warning-foreground';
      case 'mild': return 'bg-accent text-accent-foreground';
      case 'negative': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Test History</h1>
        
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
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tests yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card 
                key={test.id} 
                className="glass-card hover:shadow-elevated hover:scale-[1.01] transition-all cursor-pointer group"
                onClick={() => navigate(`/results/${test.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {test.test_type === 'malaria' ? (
                        <Activity className="h-6 w-6 text-primary" />
                      ) : (
                        <TrendingUp className="h-6 w-6 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize text-foreground">{test.test_type} Test</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(test.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {test.severity && (
                        <Badge className={getSeverityColor(test.severity)}>
                          {test.severity}
                        </Badge>
                      )}
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
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;