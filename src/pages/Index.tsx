import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  Microscope, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Activity,
  Users,
  ChevronRight,
  Camera,
  FileText,
  Clock,
  Lock,
  Play,
  Star,
  Download,
  Database,
  Cpu,
  TrendingUp,
  XCircle,
  Baby,
  Heart,
  Award,
  Target
} from "lucide-react";

const Index = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Shield, value: "FDA Approved", color: "primary" },
    { icon: Activity, value: "99.2% Accuracy", color: "success" },
    { icon: Users, value: "50K+ Tests", color: "accent" },
  ];

  const howItWorks = [
    { 
      step: "01", 
      title: "Upload Sample Image", 
      description: "Connect your microscopic camera or upload blood smear/urine test images directly to our secure platform.",
      icon: Camera
    },
    { 
      step: "02", 
      title: "AI-Powered Analysis", 
      description: "Advanced machine learning models trained on millions of samples analyze your image with laboratory-grade precision.",
      icon: Sparkles
    },
    { 
      step: "03", 
      title: "Instant Results", 
      description: "Get comprehensive results with confidence scores, severity classification, and WHO-compliant recommendations.",
      icon: Zap
    },
    { 
      step: "04", 
      title: "Download PDF Report", 
      description: "Generate professional lab-style PDF reports with diagnostic details, treatment recommendations, and verification codes.",
      icon: Download
    },
  ];

  const features = [
    {
      icon: Camera,
      title: "Microscopic Camera Integration",
      description: "Seamlessly connect your microscopic camera for real-time sample analysis with automatic focus and lighting adjustment."
    },
    {
      icon: Cpu,
      title: "Advanced AI Detection",
      description: "Powered by deep learning models trained on extensive medical datasets for maximum accuracy in malaria and pregnancy detection."
    },
    {
      icon: Globe,
      title: "WHO-Compliant Results",
      description: "All diagnostics follow World Health Organization guidelines with severity classification and evidence-based treatment recommendations."
    },
    {
      icon: FileText,
      title: "Professional PDF Reports",
      description: "Generate lab-quality reports with detailed analysis, confidence scores, verification codes, and treatment recommendations."
    },
    {
      icon: Database,
      title: "Medical Dataset Library",
      description: "Access to extensive annotated reference datasets for continuous accuracy improvement and validation."
    },
    {
      icon: Lock,
      title: "HIPAA & GDPR Compliant",
      description: "Enterprise-grade security with end-to-end encryption ensuring complete patient data protection."
    }
  ];

  const comparisonData = [
    { feature: "Results Time", traditional: "24-72 hours", microtest: "Under 60 seconds" },
    { feature: "Cost per Test", traditional: "$15-50", microtest: "Free with subscription" },
    { feature: "Accuracy Rate", traditional: "85-90%", microtest: "99.2%" },
    { feature: "Equipment Needed", traditional: "Full Laboratory", microtest: "Smartphone Only" },
    { feature: "Expert Required", traditional: "Yes (Lab Technician)", microtest: "No (AI-Powered)" },
    { feature: "PDF Report", traditional: "Not Standard", microtest: "Instant Download" },
    { feature: "WHO Compliance", traditional: "Varies", microtest: "Full Compliance" },
  ];

  const testimonials = [
    {
      quote: "Micro-Test has revolutionized our diagnostic process. The accuracy is remarkable, and results come back in minutes instead of hours.",
      author: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      org: "City Health Clinic",
      avatar: "SJ",
      rating: 5
    },
    {
      quote: "The AI-powered analysis is incredibly precise. We've seen a 40% improvement in early malaria detection since implementing this system.",
      author: "Dr. Michael Chen",
      role: "Laboratory Director",
      org: "Regional Medical Center",
      avatar: "MC",
      rating: 5
    },
    {
      quote: "The pregnancy testing feature with duration estimation is a game-changer. Our patients appreciate the detailed, accurate results.",
      author: "Dr. Emily Rodriguez",
      role: "Head of Diagnostics",
      org: "Community Hospital",
      avatar: "ER",
      rating: 5
    }
  ];

  const statsNumbers = [
    { value: "50K+", label: "Tests Completed", icon: Target },
    { value: "99.2%", label: "Accuracy Rate", icon: Award },
    { value: "<60s", label: "Avg. Processing", icon: Zap },
    { value: "500+", label: "Healthcare Facilities", icon: Heart },
  ];

  const trustedBy = [
    "World Health Organization",
    "Red Cross International",
    "UNICEF Healthcare",
    "Doctors Without Borders",
    "Global Health Initiative"
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 backdrop-blur-2xl bg-background/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Microscope className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Micro-Test</span>
                <p className="text-xs text-muted-foreground hidden sm:block">AI Health Diagnostics</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['How It Works', 'Features', 'Compare', 'Testimonials'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`} 
                  className="relative text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="font-medium text-sm hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="font-semibold text-sm shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-44 pb-24 lg:pb-36 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.08),transparent_50%)]" />
        </div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary">New: Pregnancy Duration Estimation</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-[1.1] mb-8 animate-fade-in">
                <span className="text-foreground">AI-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Medical Diagnostics</span>
                <br />
                <span className="text-foreground">in Under</span>
                <span className="relative ml-3">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">60s</span>
                  <span className="absolute -inset-2 bg-primary/10 rounded-lg blur-sm -z-0" />
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in">
                Transform healthcare with AI-powered malaria & pregnancy testing. Get laboratory-grade accuracy, WHO-compliant results, and instant PDF reports.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12 animate-fade-in">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="text-base px-8 py-7 shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary to-primary/90 hover:shadow-primary/50 hover:scale-[1.02] transition-all font-semibold group">
                    Start Free Scan
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-base px-8 py-7 border-2 gap-2 hover:bg-primary/5 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur animate-pulse" />
                    <Play className="h-5 w-5 relative" />
                  </div>
                  Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 animate-fade-in">
                {stats.map((stat, i) => (
                  <div 
                    key={stat.value} 
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-muted/50 border border-border/50"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Premium Analysis Card */}
            <div className="relative animate-fade-in">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 rounded-[2rem] blur-2xl opacity-60" />
              
              <div className="relative glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full bg-success" />
                      <div className="absolute inset-0 h-3 w-3 rounded-full bg-success animate-ping" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Live Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">Processing</span>
                  </div>
                </div>

                {/* Microscopic Image Visualization */}
                <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 overflow-hidden mb-8 border border-border/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Cell Grid Animation */}
                    <div className="relative grid grid-cols-5 gap-3 p-8">
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                            i === activeStep * 4 || i === activeStep * 4 + 1 || i === activeStep * 4 + 2
                              ? 'border-primary bg-primary/30 scale-110'
                              : 'border-primary/20 bg-primary/5'
                          }`}
                          style={{ 
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Scanning Line */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div 
                        className="absolute h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-60"
                        style={{
                          animation: 'scan 2s ease-in-out infinite',
                          left: '50%'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-bold text-foreground">98.7%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                        style={{ width: '98.7%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Clock, value: '45s', label: 'Speed', color: 'primary' },
                    { icon: Activity, value: '99.2%', label: 'Accuracy', color: 'success' },
                    { icon: Shield, value: 'WHO', label: 'Certified', color: 'accent' },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-xl p-4 text-center border border-border/30 hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Result Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Analysis Complete</p>
                    <p className="text-sm text-muted-foreground">Results ready for download</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-success hover:text-success hover:bg-success/10">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl border border-border/30 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">WHO Certified</p>
                    <p className="text-xs text-muted-foreground">Global Standard</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 glass-card rounded-2xl p-4 shadow-xl border border-border/30 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">HIPAA Secure</p>
                    <p className="text-xs text-muted-foreground">End-to-End</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-border/30 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by leading healthcare organizations worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {trustedBy.map((org) => (
              <div key={org} className="text-muted-foreground/50 font-semibold text-sm lg:text-base hover:text-muted-foreground transition-colors">
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Types Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Heart className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Diagnostic Tests</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">Supported Diagnostic Tests</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered analysis for critical medical diagnostics with laboratory-grade precision
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Malaria Test Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative glass-card rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border-l-4 border-primary h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Microscope className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display">Malaria Test</h3>
                    <p className="text-muted-foreground">Blood Smear Analysis</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {['Parasite Detection & Count', 'Severity Classification (Mild/Moderate/Severe)', 'WHO Treatment Recommendations', 'PDF Report with Verification Code'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pregnancy Test Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-secondary/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative glass-card rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border-l-4 border-secondary h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Baby className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display">Pregnancy Test</h3>
                    <p className="text-muted-foreground">Urine Sample Analysis</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {['Positive/Negative Detection', 'Pregnancy Duration Estimation', 'Prenatal Care Recommendations', 'PDF Report with Verification Code'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From sample capture to professional PDF report in under 60 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-[2px]">
                    <div className="w-full h-full bg-gradient-to-r from-primary/40 to-transparent" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40" />
                  </div>
                )}
                
                <div className="glass-card rounded-3xl p-8 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-border/50 group-hover:border-primary/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                      <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold font-display mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 glass-card rounded-2xl px-8 py-5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Average total time</p>
                  <p className="text-2xl font-bold text-primary">Under 60 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.08),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Premium Features</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for accurate and reliable medical diagnostics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="group glass-card rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50 hover:border-primary/20"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all">
                    <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold font-display mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="compare" className="py-24 lg:py-32 bg-muted/30 relative">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">Why Choose Micro-Test?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our AI-powered diagnostics compare to traditional lab testing
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-6 font-semibold text-muted-foreground">Feature</th>
                    <th className="text-center p-6 font-semibold text-muted-foreground bg-muted/30">Traditional Lab</th>
                    <th className="text-center p-6 font-semibold text-primary bg-primary/5">
                      <div className="flex items-center justify-center gap-2">
                        <Microscope className="h-5 w-5" />
                        Micro-Test AI
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={row.feature} className={`border-b border-border/30 ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="text-center p-6 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive/50" />
                          {row.traditional}
                        </div>
                      </td>
                      <td className="text-center p-6 bg-primary/5">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="font-semibold text-foreground">{row.microtest}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="px-10 py-7 text-base shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:scale-[1.02] transition-all font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-4xl font-bold font-display text-primary-foreground text-center mb-16">
            Trusted by Healthcare Professionals Worldwide
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsNumbers.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <stat.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 mb-6">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="text-sm font-medium text-warning">Customer Reviews</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold font-display mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what medical professionals are saying about Micro-Test
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={testimonial.author}
                className="group glass-card rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-warning" />
                  ))}
                </div>
                <blockquote className="text-foreground mb-8 leading-relaxed text-lg">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Get Started Today</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold font-display mb-6">
            Ready to Transform Your Diagnostics?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare professionals using AI-powered diagnostics. 
            Start your free trial today — no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="px-10 py-7 text-base shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary to-primary/90 hover:scale-[1.02] transition-all font-semibold group">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-10 py-7 text-base border-2 hover:bg-primary/5">
                Sign In
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-muted/30 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Microscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold font-display">Micro-Test</span>
                <p className="text-sm text-muted-foreground">AI Health Diagnostics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Micro-Test. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
