import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Building,
  Crown,
  Clock,
  Activity,
  FileText,
  Users,
  Shield,
  ArrowRight,
  Star
} from 'lucide-react';

const Subscription: React.FC = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const currentPlan = subscription?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with AI diagnostics',
      icon: Zap,
      color: 'muted',
      features: [
        '5 tests per month',
        'Basic AI analysis',
        'PDF report downloads',
        'Email support',
      ],
      limitations: [
        'Limited test types',
        'Standard processing',
        'Basic accuracy metrics',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For healthcare professionals and clinics',
      icon: Sparkles,
      color: 'primary',
      popular: true,
      features: [
        'Unlimited tests',
        'Advanced AI models',
        'Priority processing',
        'Detailed analytics',
        'WHO recommendations',
        'API access',
        'Priority support',
      ],
      limitations: [],
    },
    {
      id: 'clinic',
      name: 'Clinic',
      price: '$99',
      period: '/month',
      description: 'Enterprise solution for medical facilities',
      icon: Building,
      color: 'accent',
      features: [
        'Everything in Pro',
        'Multi-user accounts',
        'Custom branding',
        'Dedicated support',
        'SLA guarantee',
        'HIPAA compliance',
        'Custom integrations',
        'Training & onboarding',
      ],
      limitations: [],
    },
  ];

  const getButtonText = (planId: string) => {
    if (planId === currentPlan) return 'Current Plan';
    if (planId === 'free') return 'Downgrade';
    return 'Upgrade';
  };

  const getButtonVariant = (planId: string) => {
    if (planId === currentPlan) return 'outline' as const;
    if (planId === 'free') return 'ghost' as const;
    return 'default' as const;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Subscription Plans</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold font-display mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Unlock the full power of AI-powered diagnostics with our flexible plans
          </p>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground capitalize">
                      {subscription.plan} Plan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{subscription.status || 'Active'}</span>
                    </p>
                  </div>
                </div>
                {subscription.current_period_end && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Renews on</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative glass-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                } ${isCurrentPlan ? 'border-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}/10 flex items-center justify-center mb-4`}>
                    <PlanIcon className={`h-6 w-6 text-${plan.color}`} />
                  </div>
                  <CardTitle className="flex items-center gap-2 font-display">
                    {plan.name}
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular && !isCurrentPlan ? 'btn-premium shadow-lg shadow-primary/25' : ''}`}
                    variant={getButtonVariant(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {getButtonText(plan.id)}
                    {!isCurrentPlan && plan.id !== 'free' && (
                      <ArrowRight className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-center mb-8">
            All Plans Include
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Activity, title: 'AI Analysis', desc: 'Advanced ML models' },
              { icon: FileText, title: 'PDF Reports', desc: 'Professional exports' },
              { icon: Shield, title: 'HIPAA Secure', desc: 'Data protection' },
              { icon: Clock, title: 'Fast Results', desc: 'Under 60 seconds' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card className="glass-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-display">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-foreground">Can I cancel anytime?</p>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Do you offer refunds?</p>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee on all paid plans. Contact support if you're not satisfied.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I switch plans?</p>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade at any time. Changes take effect immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
