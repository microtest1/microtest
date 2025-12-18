import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Microscope, Mail, Lock, User, ArrowLeft, Sparkles, Shield, Zap, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'signin' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>(() => {
    const urlMode = searchParams.get('mode');
    return urlMode === 'signup' ? 'signup' : 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (mode !== 'forgot-password') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    if (mode === 'signup') {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message.includes('Invalid login credentials') 
              ? 'Invalid email or password. Please try again.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          navigate('/dashboard');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: error.message.includes('already registered') ? 'Account Exists' : 'Sign Up Failed',
            description: error.message.includes('already registered') 
              ? 'An account with this email already exists. Please sign in instead.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Welcome to MicroTest!', description: 'Your account has been created successfully.' });
          navigate('/dashboard');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for instructions to reset your password.' });
          setMode('signin');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary animate-pulse">
              <Microscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 animate-ping" />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex gradient-mesh relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-primary w-96 h-96 -top-48 -left-48 animate-blob" />
        <div className="orb orb-secondary w-80 h-80 top-1/4 -right-40 animate-blob stagger-2" />
        <div className="orb orb-accent w-72 h-72 bottom-20 left-1/4 animate-blob stagger-4" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative p-12 flex-col justify-between">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 mb-16 group">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
              <Microscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">MicroTest</h1>
              <p className="text-sm text-muted-foreground">AI Health Diagnostics</p>
            </div>
          </Link>

          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl xl:text-6xl font-bold font-display leading-tight">
                <span className="text-gradient">Next-Gen</span>
                <br />
                Medical Diagnostics
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Harness the power of AI to detect malaria and pregnancy with laboratory-grade accuracy from your smartphone.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 pt-8">
              {[
                { icon: Sparkles, title: 'AI-Powered Analysis', desc: 'Advanced ML models trained on millions of samples', color: 'primary' },
                { icon: Shield, title: 'WHO Compliant', desc: 'Following international health standards', color: 'secondary' },
                { icon: Zap, title: 'Instant Results', desc: 'Get accurate diagnostics in seconds', color: 'accent' },
              ].map((feature, i) => (
                <div 
                  key={feature.title}
                  className={`glass-card rounded-2xl p-5 hover-lift opacity-0 animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`icon-container${feature.color !== 'primary' ? `-${feature.color}` : ''} w-12 h-12`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                <span>99.2% Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground relative z-10">
          © 2024 MicroTest. Advancing healthcare through technology.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden text-center mb-8 opacity-0 animate-fade-in block">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
              <Microscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display">MicroTest</h1>
            <p className="text-muted-foreground">AI-Powered Health Diagnostics</p>
          </Link>

          <Card className="glass-card border-0 shadow-elevated opacity-0 animate-fade-in-up">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold font-display text-center">
                {mode === 'signin' && 'Welcome back'}
                {mode === 'signup' && 'Create your account'}
                {mode === 'forgot-password' && 'Reset password'}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === 'signin' && 'Sign in to access your health dashboard'}
                {mode === 'signup' && 'Start your 14-day free trial today'}
                {mode === 'forgot-password' && "We'll send you a reset link"}
              </CardDescription>
              
              {mode === 'signup' && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-success/10 border border-success/20 rounded-lg px-4 py-2 mt-3">
                  <Sparkles className="h-4 w-4 text-success" />
                  <span>No credit card required</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                {mode !== 'forgot-password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold btn-premium shadow-lg shadow-primary/25"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      {mode === 'signin' && 'Signing in...'}
                      {mode === 'signup' && 'Creating account...'}
                      {mode === 'forgot-password' && 'Sending...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === 'signin' && (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                      {mode === 'signup' && (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Start Free Trial
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                      {mode === 'forgot-password' && 'Send Reset Link'}
                    </span>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center space-y-3">
                {mode === 'signin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors animated-underline"
                    >
                      Forgot your password?
                    </button>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-primary font-semibold hover:text-primary/80 transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                )}
                
                {mode === 'signup' && (
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                
                {mode === 'forgot-password' && (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6 opacity-0 animate-fade-in stagger-3">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
