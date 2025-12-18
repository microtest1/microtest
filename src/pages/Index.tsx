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
  Award,
  ChevronRight,
  Camera,
  FileText,
  Clock,
  Lock,
  Play,
  Star,
  Download,
  Database
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
      title: "Connect Camera or Upload", 
      description: "Connect your microscopic camera or upload sample images directly to our secure platform.",
      icon: Camera
    },
    { 
      step: "02", 
      title: "AI Image Processing", 
      description: "Our advanced AI analyzes the sample using trained models and medical datasets for accurate detection.",
      icon: Sparkles
    },
    { 
      step: "03", 
      title: "Instant Results", 
      description: "Get comprehensive results with confidence scores, severity classification, and WHO-based recommendations.",
      icon: Zap
    },
    { 
      step: "04", 
      title: "Download PDF Report", 
      description: "Generate and download professional lab-style PDF reports with all diagnostic details and treatment recommendations.",
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
      icon: Sparkles,
      title: "Advanced AI Models",
      description: "Powered by advanced machine learning, trained on extensive medical datasets for maximum accuracy."
    },
    {
      icon: Globe,
      title: "WHO-Compliant Results",
      description: "All diagnostics follow WHO guidelines with severity classification and evidence-based treatment recommendations."
    },
    {
      icon: FileText,
      title: "Professional PDF Reports",
      description: "Generate lab-quality reports with detailed analysis, confidence scores, and treatment recommendations."
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
    { value: "45s", label: "Avg. Processing Time" },
    { value: "500+", label: "Healthcare Facilities" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Microscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Micro-Test</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">How It Works</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</a>
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
                  Get Started
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
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-foreground">AI-Powered Medical</span>
                <br />
                <span className="text-primary">Diagnostics in Minutes</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Malaria & Pregnancy Testing Through Microscopic Image Analysis. Fast, accurate, and WHO-compliant diagnostics powered by advanced AI technology.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="text-base px-8 py-6 shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 font-semibold">
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
                    <stat.icon className={`h-5 w-5 text-${stat.color}`} />
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
                      <div className="relative grid grid-cols-3 gap-4 p-8">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-primary/30 bg-primary/10"
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              opacity: 0.5 + (Math.random() * 0.5)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-bold text-foreground">98.7%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[98.7%] rounded-full bg-gradient-to-r from-primary to-primary/80 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">45s</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Avg. Processing Time</span>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-success" />
                      <span className="text-2xl font-bold">99.2%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Accuracy Rate</span>
                  </div>
                </div>

                {/* Result Status */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">Test Complete</p>
                    <p className="text-sm text-muted-foreground">Results ready</p>
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
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to get accurate medical diagnostics powered by AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg shadow-primary/25">
                      {item.step}
                    </div>
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 glass-card rounded-xl px-6 py-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Average processing time</span>
              <span className="text-2xl font-bold text-primary">45 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
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
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground text-center mb-12">
            Trusted by Healthcare Professionals
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what medical professionals are saying about Micro-Test
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.author}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary">{testimonial.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare professionals using Micro-Test to deliver better patient outcomes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-base px-10 py-6 shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 font-semibold">
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="text-base px-10 py-6 border-2">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free trial available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Microscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Micro-Test</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Micro-Test. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
