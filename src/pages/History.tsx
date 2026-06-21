import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, CheckCircle2, Clock, ChevronRight, Microscope, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

  const getSeverityBadge = (severity: SeverityLevel | null) => {
    switch (severity) {
      case 'severe':
      case 'moderate':
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            Detected
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Not Detected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
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

  const trendData = useMemo(() => {
    return [...tests]
      .filter(t => t.status === 'completed' && typeof t.confidence_score === 'number')
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      .slice(-20)
      .map(t => ({
        date: format(new Date(t.created_at), 'MMM d'),
        confidence: Math.round(Number(t.confidence_score) || 0),
        positive: t.severity && t.severity !== 'negative' ? 1 : 0,
      }));
  }, [tests]);

  const stats = useMemo(() => {
    const total = tests.length;
    const positive = tests.filter(t => t.severity && t.severity !== 'negative').length;
    const negative = tests.filter(t => t.severity === 'negative').length;
    const avgConf = tests.length
      ? Math.round(
          tests.reduce((s, t) => s + (Number(t.confidence_score) || 0), 0) /
            Math.max(1, tests.filter(t => typeof t.confidence_score === 'number').length),
        )
      : 0;
    return { total, positive, negative, avgConf };
  }, [tests]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Screening History
          </h1>
          <p className="text-muted-foreground mt-1 ml-13">
            View all your malaria screening results
          </p>
        </div>

        {/* Stats + trend */}
        {tests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Detected</p>
                <p className="text-2xl font-bold text-destructive mt-1">{stats.positive}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Not Detected</p>
                <p className="text-2xl font-bold text-success mt-1">{stats.negative}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Confidence</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.avgConf}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {trendData.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Confidence Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Screening History
          </h1>
          <p className="text-muted-foreground mt-1 ml-13">
            View all your malaria screening results
          </p>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Microscope className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No screenings yet</h3>
              <p className="text-sm text-muted-foreground">
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
                <div className="space-y-2">
                  {dateTests.map((test) => (
                    <Card 
                      key={test.id} 
                      className="hover:shadow-md cursor-pointer transition-all"
                      onClick={() => navigate(`/results/${test.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Microscope className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">Malaria Screening</h3>
                              {test.parasite_species && (
                                <span className="text-xs text-muted-foreground">
                                  • {test.parasite_species}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(test.created_at), 'h:mm a')}
                              {test.confidence_score && (
                                <span className="ml-2">• {Math.round(test.confidence_score)}% confidence</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getSeverityBadge(test.severity)}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
