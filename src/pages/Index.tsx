import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Baby
} from "lucide-react";

const Index = () => {
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
      avatar: "SJ"
    },
    {
      quote: "The AI-powered analysis is incredibly precise. We've seen a 40% improvement in early malaria detection since implementing this system.",
      author: "Dr. Michael Chen",
      role: "Laboratory Director",
      org: "Regional Medical Center",
      avatar: "MC"
    },
    {
      quote: "The pregnancy testing feature with duration estimation is a game-changer. Our patients appreciate the detailed, accurate results.",
      author: "Dr. Emily Rodriguez",
      role: "Head of Diagnostics",
      org: "Community Hospital",
      avatar: "ER"
    }
  ];

  const statsNumbers = [
    { value: "50K+", label: "Tests Completed" },
    { value: "99.2%", label: "Accuracy Rate" },
    { value: "45s", label: "Avg. Processing" },
    { value: "500+", label: "Healthcare Facilities" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Microscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold font-display">Micro-Test</span>
                <p className="text-xs text-muted-foreground hidden sm:block">AI Health Diagnostics</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">How It Works</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</a>
              <a href="#comparison" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Compare</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="font-medium text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="font-semibold text-sm shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">New: Pregnancy Duration Estimation</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
                <span className="text-foreground">AI-Powered</span>
                <br />
                <span className="text-gradient">Medical Diagnostics</span>
                <br />
                <span className="text-foreground">in Under 60 Seconds</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Malaria & Pregnancy Testing Through Microscopic Image Analysis. Fast, accurate, and WHO-compliant diagnostics powered by advanced AI technology.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="text-base px-8 py-6 shadow-xl shadow-primary/30 btn-premium font-semibold">
                    Start Free Scan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 gap-2">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {stats.map((stat) => (
                  <div key={stat.value} className="flex items-center gap-2 text-sm">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-muted-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Live Analysis Card */}
            <div className="relative">
              <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">Live Analysis</span>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">Processing</span>
                </div>

                {/* Microscopic Image Placeholder */}
                <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-muted to-muted/50 overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                      <div className="relative grid grid-cols-4 gap-3 p-6">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-primary/40 bg-primary/20 animate-pulse"
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              opacity: 0.4 + (Math.random() * 0.6)
                            }}
                          />
                        ))}
                      </div>
                      {/* Scanning line */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-bold text-foreground">98.7%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[98.7%] rounded-full bg-gradient-to-r from-primary to-primary/80" />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xl font-bold">45s</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Processing</span>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="h-4 w-4 text-success" />
                      <span className="text-xl font-bold">99.2%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-4 w-4 text-accent" />
                      <span className="text-xl font-bold">WHO</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Certified</span>
                  </div>
                </div>

                {/* Result Status */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">Test Complete</p>
                    <p className="text-sm text-muted-foreground">Results ready for download</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">WHO Certified</span>
                </div>
              </div>

              {/* Floating Badge Right */}
              <div className="absolute -top-4 -right-4 glass-card rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm font-medium">HIPAA Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Types Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">Supported Diagnostic Tests</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered analysis for critical medical diagnostics
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Malaria Test Card */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow border-l-4 border-primary">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Microscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display">Malaria Test</h3>
                  <p className="text-muted-foreground">Blood Smear Analysis</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Parasite Detection & Count</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Severity Classification (Mild/Moderate/Severe)</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>WHO Treatment Recommendations</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>PDF Report with Verification Code</span>
                </li>
              </ul>
            </div>

            {/* Pregnancy Test Card */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow border-l-4 border-secondary">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Baby className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display">Pregnancy Test</h3>
                  <p className="text-muted-foreground">Urine Sample Analysis</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Positive/Negative Detection</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Pregnancy Duration Estimation</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Prenatal Care Recommendations</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>PDF Report with Verification Code</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From sample capture to professional PDF report in under 60 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg shadow-primary/25">
                      {item.step}
                    </div>
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold font-display mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 glass-card rounded-xl px-6 py-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Average total time:</span>
              <span className="text-2xl font-bold text-primary">Under 60 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for accurate and reliable medical diagnostics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">Why Choose Micro-Test?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our AI-powered diagnostics compare to traditional lab testing
            </p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Feature</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground bg-muted/30">Traditional Lab</th>
                    <th className="text-center p-4 font-semibold text-primary bg-primary/5">Micro-Test AI</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? "bg-muted/10" : ""}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="text-center p-4 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive/60" />
                          {row.traditional}
                        </div>
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="font-medium text-foreground">{row.microtest}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-premium shadow-xl shadow-primary/25">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-primary-foreground text-center mb-12">
            Trusted by Healthcare Professionals Worldwide
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsNumbers.map((stat) => (
              <div key={stat.label} className="text-center">
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
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what medical professionals are saying about Micro-Test
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.author}
                className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-warning" />
                  ))}
                </div>
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold font-display mb-6">
            Ready to Transform Your Diagnostics?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals using AI-powered diagnostics. 
            Start your free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-premium px-8 py-6 text-base shadow-xl shadow-primary/25">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base border-2">
                Sign In
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Microscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold font-display">Micro-Test</span>
                <p className="text-sm text-muted-foreground">AI Health Diagnostics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Micro-Test. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
