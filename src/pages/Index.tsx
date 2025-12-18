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
  ChevronRight
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Microscope,
      title: "AI-Powered Analysis",
      description: "Advanced deep learning algorithms trained on millions of samples for accurate diagnostics"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive analysis in under 60 seconds with detailed severity assessment"
    },
    {
      icon: Shield,
      title: "WHO Compliant",
      description: "Following World Health Organization guidelines for standardized recommendations"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Bringing laboratory-grade diagnostics to remote and underserved communities"
    }
  ];

  const stats = [
    { value: "99.2%", label: "Accuracy Rate" },
    { value: "2M+", label: "Tests Analyzed" },
    { value: "150+", label: "Countries" },
    { value: "<60s", label: "Analysis Time" }
  ];

  const testimonials = [
    {
      quote: "MicroTest has revolutionized how we conduct field diagnostics. The accuracy is remarkable.",
      author: "Dr. Sarah Chen",
      role: "WHO Medical Advisor",
      avatar: "SC"
    },
    {
      quote: "Finally, a solution that brings advanced diagnostics to where it's needed most.",
      author: "Dr. James Okonkwo",
      role: "Field Medical Director",
      avatar: "JO"
    },
    {
      quote: "The AI analysis is incredibly precise. It's like having a specialist in your pocket.",
      author: "Dr. Maria Santos",
      role: "Clinical Researcher",
      avatar: "MS"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[800px] h-[800px] bg-primary/20 -top-[400px] -right-[200px]" />
        <div className="orb w-[600px] h-[600px] bg-accent/15 bottom-[10%] -left-[200px]" style={{ animationDelay: '2s' }} />
        <div className="orb w-[400px] h-[400px] bg-success/10 top-[40%] right-[10%]" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Microscope className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MicroTest
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  AI Diagnostics
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="btn-premium font-semibold shadow-lg shadow-primary/25">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by healthcare professionals worldwide</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-8 animate-fade-in">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Medical Diagnostics
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Transform smartphone microscopy into laboratory-grade diagnostics. 
              Detect malaria parasites and pregnancy hormones with unprecedented accuracy using advanced AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="btn-premium text-lg px-8 py-6 shadow-2xl shadow-primary/30 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-accent/50">
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium">ISO 13485 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">FDA Registered</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-20 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Sample Preview */}
                  <div className="glass-card p-6 rounded-xl">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 overflow-hidden">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.3)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--accent)/0.2)_0%,transparent_40%)]" />
                        <Microscope className="h-16 w-16 text-primary/60" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-muted-foreground">Blood Sample Analysis</p>
                  </div>

                  {/* AI Processing */}
                  <div className="glass-card p-6 rounded-xl flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary-foreground animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-muted-foreground">AI Processing</p>
                    <div className="mt-3 flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="glass-card p-6 rounded-xl">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="text-sm font-semibold text-success">Negative</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className="text-sm font-semibold">99.2%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-success to-success/80" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-muted-foreground">Instant Results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Why Choose MicroTest
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets medical expertise for unparalleled diagnostic accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group glass-card p-8 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to accurate diagnostics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Capture Sample", description: "Use your smartphone with our microscope attachment to capture a high-resolution image of your sample" },
              { step: "02", title: "AI Analysis", description: "Our advanced neural network analyzes the sample, identifying parasites or markers with laboratory precision" },
              { step: "03", title: "Get Results", description: "Receive detailed findings, severity assessment, and WHO-compliant recommendations in under 60 seconds" }
            ].map((item, index) => (
              <div key={item.step} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="glass-card p-8 rounded-2xl text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-display font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Trusted by Experts
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Healthcare professionals worldwide rely on MicroTest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.author}
                className="glass-card p-8 rounded-2xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="h-4 w-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 md:p-16 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Ready to Transform Your Diagnostics?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of healthcare professionals using MicroTest to deliver better patient outcomes
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="btn-premium text-lg px-10 py-7 shadow-2xl shadow-primary/30 group">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Your Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Microscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">MicroTest</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 MicroTest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
