import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Microscope,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Activity,
  Users,
  ChevronRight,
  Droplets,
  Target,
  FileCheck,
  Building2,
  UserCheck,
  Globe,
} from "lucide-react";

const Index = () => {
  const steps = [
    { step: "01", title: "Prepare Blood Smear", description: "Collect a thin blood smear sample following standard laboratory preparation protocols.", icon: Droplets },
    { step: "02", title: "Capture Image", description: "Use the Microtest microscope attachment to capture a high-resolution image of the sample.", icon: Microscope },
    { step: "03", title: "AI Analysis", description: "Our AI analyzes the image, identifying malaria parasites and estimating parasite density.", icon: Activity },
    { step: "04", title: "Review Results", description: "Receive screening results with confidence levels and clinical guidance within seconds.", icon: FileCheck },
  ];

  const comparisonData = [
    { feature: "Expertise Required", traditional: "Trained microscopist", microtest: "Guided by AI" },
    { feature: "Analysis Method", traditional: "Manual parasite counting", microtest: "AI-assisted detection" },
    { feature: "Time to Results", traditional: "15–60 minutes", microtest: "Under 60 seconds" },
    { feature: "Consistency", traditional: "Variable (fatigue, training)", microtest: "Standardized analysis" },
    { feature: "Accessibility", traditional: "Limited in rural areas", microtest: "Portable, mobile-based" },
    { feature: "Documentation", traditional: "Manual record keeping", microtest: "Automatic digital records" },
  ];

  return (
    <div className="dark min-h-screen bg-[#08090b] text-zinc-100 selection:bg-cyan-400/30 selection:text-white overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[40%] left-[10%] h-[320px] w-[320px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] h-[280px] w-[280px] rounded-full bg-teal-400/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 pt-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Microscope className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight">microtest</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 backdrop-blur-xl">
            <a href="#how-it-works" className="px-4 py-1.5 text-sm rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/20">
              For Clinics
            </a>
            <a href="#comparison" className="px-4 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full transition-colors">
              For Patients
            </a>
            <a href="#features" className="px-4 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full transition-colors">
              Features
            </a>
            <a href="#about" className="px-4 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white px-3 py-1.5 transition-colors">
              <Globe className="h-4 w-4" />
              En
            </button>
            <Link to="/auth" className="hidden sm:block">
              <button className="text-sm text-zinc-200 hover:text-white px-3 py-1.5 transition-colors">Sign in</button>
            </Link>
            <Link to="/auth?mode=signup">
              <button className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-8 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-xs text-zinc-200">AI-Assisted Screening · WHO-Aligned</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            Where Diagnostics and
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Communities Connect
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10">
            Microtest brings AI-powered mobile microscopy to clinicians and patients, delivering early malaria screening in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/auth?mode=signup">
              <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-300/90 to-pink-400/90 text-zinc-900 font-medium shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all">
                <UserCheck className="h-4 w-4" />
                Sign up as a Clinic
              </button>
            </Link>
            <Link to="/auth?mode=signup">
              <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
                <Shield className="h-4 w-4" />
                Sign up as a Patient
              </button>
            </Link>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto max-w-[280px] sm:max-w-[320px]">
            <div className="absolute -inset-20 bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl -z-10" />
            <div className="relative rounded-[3rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-zinc-950 p-2.5 shadow-2xl shadow-cyan-500/10">
              <div className="rounded-[2.4rem] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 aspect-[9/19] relative overflow-hidden">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-20 rounded-full bg-zinc-900/90" />
                <div className="absolute top-2.5 left-6 text-[10px] text-white font-medium">9:41</div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                    <Microscope className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-white text-2xl font-semibold tracking-tight">microtest</span>
                  <div className="mt-4 w-full rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-4 text-left">
                    <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Result</div>
                    <div className="text-white font-semibold text-sm">No parasites detected</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[92%] bg-white rounded-full" />
                    </div>
                    <div className="text-[10px] text-white/70 mt-1.5">Confidence 92%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-xs text-zinc-500">
            <span>WHO-aligned</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Offline-ready</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>HIPAA-conscious</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-3">Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">How Microtest Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">A simple four-step process for AI-assisted malaria screening.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-sm hover:border-cyan-400/30 transition-colors"
              >
                <div className="text-[11px] font-mono text-cyan-400/70 mb-4">{step.step}</div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/20 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                {index < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 h-5 w-5 text-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-3">Comparison</div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Traditional Microscopy vs Microtest</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Understanding the differences between conventional methods and AI-assisted screening.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-medium">Feature</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Traditional</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cyan-300 font-medium">
                    <div className="flex items-center gap-2"><Microscope className="h-3.5 w-3.5" /> Microtest</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5 last:border-b-0">
                    <td className="px-6 py-4 text-sm font-medium text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{row.traditional}</td>
                    <td className="px-6 py-4 text-sm text-zinc-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        {row.microtest}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-3">Capabilities</div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Designed for Healthcare Workers</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Built to support malaria screening in clinics, laboratories, and field settings.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Target, title: "Parasite Detection", desc: "AI-powered analysis identifies Plasmodium parasites and provides preliminary species classification." },
              { icon: Zap, title: "Rapid Screening", desc: "Receive preliminary results in under 60 seconds, enabling faster clinical decision-making." },
              { icon: Shield, title: "Clinical Guidance", desc: "Results include severity estimates and guidance aligned with WHO treatment recommendations." },
              { icon: Building2, title: "Works Offline", desc: "Capture images offline and sync results when connectivity is available. Ideal for remote settings." },
              { icon: FileCheck, title: "Digital Records", desc: "All screening results are saved with timestamps and can be exported as PDF reports." },
              { icon: UserCheck, title: "Easy to Use", desc: "Simple interface designed for healthcare workers with minimal training required." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-sm hover:border-cyan-400/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/20 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-transparent p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.4), transparent 60%)" }} />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Ready to Start Screening?</h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Begin using Microtest for AI-assisted malaria screening. Simple setup, immediate results.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth?mode=signup">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
                  Start Free Screening <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/auth">
                <button className="px-6 py-3 rounded-full border border-white/15 text-white hover:bg-white/5 transition-colors">Sign In</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Microscope className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-semibold">microtest</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                AI-assisted early malaria screening using mobile microscopy. Built for clinicians and field settings.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4 text-sm">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#how-it-works" className="block text-zinc-500 hover:text-white transition-colors">How It Works</a>
                <a href="#comparison" className="block text-zinc-500 hover:text-white transition-colors">Compare</a>
                <a href="#features" className="block text-zinc-500 hover:text-white transition-colors">Features</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4 text-sm">Account</h4>
              <div className="space-y-2 text-sm">
                <Link to="/auth" className="block text-zinc-500 hover:text-white transition-colors">Sign In</Link>
                <Link to="/auth?mode=signup" className="block text-zinc-500 hover:text-white transition-colors">Sign Up</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Microtest. For healthcare professional use.</p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>Instagram</span>
              <span>LinkedIn</span>
              <span>X</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
