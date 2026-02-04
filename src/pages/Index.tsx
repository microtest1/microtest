import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Microscope, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Activity,
  Clock,
  Users,
  ChevronRight,
  Droplets,
  Target,
  FileCheck,
  Building2,
  UserCheck,
  AlertCircle,
  MapPin
} from "lucide-react";

const Index = () => {
  const steps = [
    { 
      step: "01", 
      title: "Prepare Blood Smear", 
      description: "Collect a thin blood smear sample following standard laboratory preparation protocols.",
      icon: Droplets
    },
    { 
      step: "02", 
      title: "Capture Image", 
      description: "Use the Microtest microscope attachment to capture a high-resolution image of the sample.",
      icon: Microscope
    },
    { 
      step: "03", 
      title: "AI Analysis", 
      description: "Our AI analyzes the image, identifying malaria parasites and estimating parasite density.",
      icon: Activity
    },
    { 
      step: "04", 
      title: "Review Results", 
      description: "Receive screening results with confidence levels and clinical guidance within seconds.",
      icon: FileCheck
    },
  ];

  const comparisonData = [
    { 
      feature: "Expertise Required", 
      traditional: "Trained microscopist", 
      microtest: "Guided by AI" 
    },
    { 
      feature: "Analysis Method", 
      traditional: "Manual parasite counting", 
      microtest: "AI-assisted detection" 
    },
    { 
      feature: "Time to Results", 
      traditional: "15-60 minutes", 
      microtest: "Under 60 seconds" 
    },
    { 
      feature: "Consistency", 
      traditional: "Variable (fatigue, training)", 
      microtest: "Standardized analysis" 
    },
    { 
      feature: "Accessibility", 
      traditional: "Limited in rural areas", 
      microtest: "Portable, mobile-based" 
    },
    { 
      feature: "Documentation", 
      traditional: "Manual record keeping", 
      microtest: "Automatic digital records" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Microscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-foreground">Microtest</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Early Malaria Screening</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#comparison" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Compare
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-8 animate-fade-in">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">AI-Assisted Screening Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-foreground leading-tight mb-6 animate-fade-in">
              Early Malaria Screening
              <span className="block text-primary mt-2">Using Mobile Microscopy</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Microtest uses AI-powered image analysis to assist healthcare workers in early malaria screening, providing preliminary results in under 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90">
                  Start Malaria Screening
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="text-base px-8 py-6">
                  How It Works
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-foreground">&lt;60s</div>
                <div className="text-sm text-muted-foreground">Analysis Time</div>
              </div>
              <div className="text-center p-4 border-x border-border">
                <div className="text-2xl font-bold text-foreground">AI</div>
                <div className="text-sm text-muted-foreground">Assisted</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-foreground">Portable</div>
                <div className="text-sm text-muted-foreground">Mobile-based</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="py-4 bg-warning/10 border-y border-warning/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Screening Tool Only:</span> Microtest provides preliminary screening results. Laboratory confirmation is recommended for all positive results.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              How Microtest Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple four-step process for AI-assisted malaria screening
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={step.step} 
                className="relative bg-card rounded-xl p-6 border border-border animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Step {step.step}
                </div>
                
                <div className="mt-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Connector Arrow */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              Traditional Microscopy vs Microtest
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understanding the differences between conventional methods and AI-assisted screening
            </p>
          </div>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Traditional Microscopy
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    <div className="flex items-center gap-2">
                      <Microscope className="h-4 w-4" />
                      Microtest (AI-Assisted)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr 
                    key={row.feature} 
                    className={`border-b border-border last:border-b-0 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.traditional}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                        {row.microtest}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Note: Microtest is designed to assist, not replace, trained healthcare professionals. Results should be confirmed with standard laboratory methods.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-4">
              Designed for Healthcare Workers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built to support malaria screening in clinics, laboratories, and field settings
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Parasite Detection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered analysis identifies Plasmodium parasites and provides preliminary species classification.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Rapid Screening</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive preliminary results in under 60 seconds, enabling faster clinical decision-making.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Clinical Guidance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Results include severity estimates and guidance aligned with WHO treatment recommendations.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Works Offline</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Capture images offline and sync results when connectivity is available. Ideal for remote settings.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Digital Records</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All screening results are saved with timestamps and can be exported as PDF reports.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy to Use</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Simple interface designed for healthcare workers with minimal training required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-foreground mb-4">
              Ready to Start Screening?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Begin using Microtest for AI-assisted malaria screening. Simple setup, immediate results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6">
                  Start Free Screening
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Microscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-display text-foreground">Microtest</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-assisted early malaria screening using mobile microscopy. Designed to support healthcare workers in clinics and field settings.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Important Notice</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Microtest is a screening tool and does not replace professional medical diagnosis. All positive results should be confirmed through standard laboratory methods.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
                <a href="#comparison" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Compare Methods
                </a>
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Microtest. For healthcare professional use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
