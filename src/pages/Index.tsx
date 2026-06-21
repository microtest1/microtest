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
  AlertCircle,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";

const Index = () => {
  const steps = [
    { step: "01", title: "Prepare Blood Smear", description: "Standard thin blood smear preparation following WHO laboratory protocols.", icon: Droplets },
    { step: "02", title: "Capture Image", description: "Snap a high-resolution field through the Microtest microscope attachment.", icon: Microscope },
    { step: "03", title: "AI Analysis", description: "Our model detects Plasmodium parasites and estimates parasite density.", icon: Activity },
    { step: "04", title: "Clinical Report", description: "Receive a confidence-scored screening report with WHO-aligned guidance.", icon: FileCheck },
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[hsl(258_90%_55%/.25)] blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(258_90%_66%)] shadow-[0_8px_24px_-8px_hsl(245_85%_50%/0.7)]">
              <Microscope className="absolute inset-0 m-auto h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block font-display text-lg font-bold tracking-tight">Microtest</span>
              <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block">Mobile Malaria Screening</span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#comparison" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Compare</a>
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</a>
            <a href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/auth?mode=signup"><Button size="sm" className="btn-primary !px-4 !py-2 text-sm">Get Started<ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO — Split Screen */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Left: copy */}
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-secondary" />
              </span>
              <span className="text-xs font-medium tracking-wide text-foreground/90">AI-assisted screening · WHO-aligned</span>
            </div>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem] animate-fade-in-up">
              <span className="text-gradient">Detect malaria</span>
              <br />
              <span className="text-foreground/95">in under a </span>
              <span className="text-gradient-primary">minute.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-in-up stagger-2">
              Microtest turns any smartphone into a clinical-grade malaria screening device. Capture a blood smear, our AI flags Plasmodium parasites with confidence scoring and parasite density — fast enough for the field, rigorous enough for the lab.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center animate-fade-in-up stagger-3">
              <Link to="/auth?mode=signup">
                <button className="btn-primary group w-full sm:w-auto">
                  Start screening free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <a href="#how-it-works" className="btn-outline w-full sm:w-auto">
                See how it works
                <ChevronRight className="ml-1.5 h-5 w-5" />
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] animate-fade-in-up stagger-4">
              {[
                { k: "<60s", v: "Analysis" },
                { k: "94%+", v: "Sensitivity*" },
                { k: "Offline", v: "Field-ready" },
              ].map((s) => (
                <div key={s.v} className="bg-background/40 px-4 py-4 text-center">
                  <div className="font-display text-2xl font-bold text-gradient-primary">{s.k}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground/70">*Sensitivity measured on internal validation dataset. Screening tool only — confirm positives with laboratory diagnostics.</p>
          </div>

          {/* Right: device / microscope visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[9/16] w-full max-w-[420px] mx-auto">
              {/* Floating glow */}
              <div aria-hidden className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-primary/40 via-[hsl(258_90%_60%/.3)] to-transparent blur-3xl animate-glow-pulse" />

              {/* Phone frame */}
              <div className="relative h-full w-full rounded-[2.75rem] border border-white/10 bg-gradient-to-b from-[hsl(240_42%_9%)] to-[hsl(240_45%_5%)] p-3 shadow-[0_40px_120px_-30px_hsl(245_85%_40%/0.7)]">
                <div className="absolute inset-x-0 top-0 z-20 mx-auto h-6 w-32 rounded-b-2xl bg-black/80" />
                <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] border border-white/5 bg-background">
                  {/* Screen content — microscope view */}
                  <div className="flex h-full flex-col">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pt-6 pb-3 text-[11px] text-muted-foreground">
                      <span>9:41</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        Live capture
                      </span>
                    </div>

                    {/* Microscope viewport */}
                    <div className="relative mx-4 microscope-view !aspect-square">
                      {/* Field of view image (simulated cells) */}
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-90"
                             style={{
                               backgroundImage:
                                 "radial-gradient(circle at 30% 35%, hsl(340 70% 55% / .55) 0 14px, transparent 16px),\
                                  radial-gradient(circle at 65% 55%, hsl(340 65% 50% / .5) 0 12px, transparent 14px),\
                                  radial-gradient(circle at 45% 70%, hsl(345 75% 60% / .55) 0 10px, transparent 12px),\
                                  radial-gradient(circle at 75% 30%, hsl(335 60% 45% / .45) 0 11px, transparent 13px),\
                                  radial-gradient(circle at 20% 75%, hsl(340 70% 55% / .45) 0 9px, transparent 11px),\
                                  radial-gradient(circle at 85% 80%, hsl(345 70% 55% / .5) 0 13px, transparent 15px)"
                             }}
                        />
                        <div className="absolute inset-0 microscope-overlay" />
                        {/* Scan line */}
                        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent animate-scan" />
                      </div>

                      {/* AI detection box */}
                      <div className="absolute left-[26%] top-[28%] h-16 w-16 rounded-md border-2 border-secondary shadow-[0_0_20px_hsl(172_75%_55%/.6)]">
                        <span className="absolute -top-5 left-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold text-secondary-foreground">P. falciparum · 97%</span>
                      </div>
                      <div className="absolute left-[60%] top-[50%] h-12 w-12 rounded-md border-2 border-primary/80 shadow-[0_0_18px_hsl(245_85%_64%/.55)]" />

                      {/* Corner crosshairs */}
                      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((p) => (
                        <div key={p} className={`absolute ${p} h-3 w-3 border-secondary/70`} style={{ borderTopWidth: p.includes("top") ? 2 : 0, borderBottomWidth: p.includes("bottom") ? 2 : 0, borderLeftWidth: p.includes("left") ? 2 : 0, borderRightWidth: p.includes("right") ? 2 : 0 }} />
                      ))}
                    </div>

                    {/* Result panel */}
                    <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Screening result</div>
                          <div className="mt-1 flex items-center gap-2 font-display text-base font-semibold text-destructive">
                            <AlertCircle className="h-4 w-4" /> Parasites detected
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</div>
                          <div className="font-display text-lg font-bold text-gradient-primary">96.4%</div>
                        </div>
                      </div>
                      <div className="mt-3 progress-bar">
                        <div className="progress-bar-fill" style={{ width: "96%" }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Density: ++ (moderate)</span>
                        <span>Sample #A-2741</span>
                      </div>
                    </div>

                    <div className="flex-1" />
                    <div className="mb-5 flex items-center justify-center">
                      <div className="h-1.5 w-24 rounded-full bg-white/15" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating chip */}
              <div className="absolute -left-6 top-12 hidden rounded-2xl border border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl shadow-xl animate-float sm:block">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-xs font-semibold">AI online</div>
                    <div className="text-[10px] text-muted-foreground">Lovable Gateway · v3.2</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-20 hidden rounded-2xl border border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl shadow-xl animate-float sm:block" style={{ animationDelay: "1.2s" }}>
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs font-semibold">End-to-end encrypted</div>
                    <div className="text-[10px] text-muted-foreground">HIPAA · GDPR ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="relative border-y border-white/5 bg-warning/[0.06] py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 text-center sm:px-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-warning" />
          <p className="text-sm text-foreground/90">
            <span className="font-semibold">Screening tool only.</span> Microtest provides preliminary results. Confirm all positives with standard laboratory diagnostics.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-primary" /> Workflow
            </div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">From smear to <span className="text-gradient-primary">screening report</span> in four steps</h2>
            <p className="mt-4 text-muted-foreground">A clean clinical flow designed for healthcare workers in clinics, labs, and the field.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="medical-card group p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-3xl font-bold text-white/10">{step.step}</div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-primary/20 to-[hsl(258_90%_60%/.15)] text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                {index < 3 && (
                  <div className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-primary/30 lg:block">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="comparison" className="relative py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Traditional microscopy vs <span className="text-gradient-primary">Microtest</span></h2>
            <p className="mt-4 text-muted-foreground">Built to assist — never replace — trained healthcare professionals.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Feature</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Traditional</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2 text-gradient-primary"><Microscope className="h-4 w-4 text-primary" />Microtest</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.traditional}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-secondary" />
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

      {/* FEATURES */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">A platform built for <span className="text-gradient-primary">global health</span></h2>
            <p className="mt-4 text-muted-foreground">Premium tooling for the clinics, NGOs, and ministries delivering care where it's needed most.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Target, t: "Parasite detection", d: "AI identifies Plasmodium parasites with preliminary species classification.", color: "from-primary/25 to-[hsl(258_90%_60%/.15)]" },
              { i: Zap, t: "Rapid screening", d: "Preliminary results in under 60 seconds for faster clinical decisions.", color: "from-secondary/25 to-secondary/5" },
              { i: Shield, t: "Clinical guidance", d: "Severity estimates and treatment guidance aligned with WHO recommendations.", color: "from-primary/25 to-[hsl(258_90%_60%/.15)]" },
              { i: Globe, t: "Works offline", d: "Capture in the field, sync when connectivity returns. Ideal for remote sites.", color: "from-secondary/25 to-secondary/5" },
              { i: FileCheck, t: "Digital records", d: "Every screening saved with timestamps and exportable as a PDF report.", color: "from-primary/25 to-[hsl(258_90%_60%/.15)]" },
              { i: Lock, t: "Encrypted by default", d: "End-to-end encryption with strict role-based access. HIPAA & GDPR aware.", color: "from-secondary/25 to-secondary/5" },
            ].map((f) => (
              <div key={f.t} className="medical-card p-6">
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${f.color}`}>
                  <f.i className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 sm:p-16">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[hsl(258_90%_45%/.25)] to-transparent" />
            <div aria-hidden className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[hsl(258_90%_60%/.25)] blur-3xl" />
            <div className="relative text-center">
              <h2 className="font-display text-3xl font-bold sm:text-5xl"><span className="text-gradient">Ready to screen?</span></h2>
              <p className="mx-auto mt-4 max-w-xl text-foreground/80">Begin AI-assisted malaria screening today. Simple setup, immediate results, deployable anywhere.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/auth?mode=signup"><button className="btn-primary">Start free screening<ArrowRight className="ml-2 h-5 w-5" /></button></Link>
                <Link to="/auth"><button className="btn-outline">Sign in</button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="relative border-t border-white/5 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(258_90%_66%)] flex items-center justify-center">
                  <Microscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold">Microtest</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">AI-assisted malaria screening for clinics, labs, and the field. Built for global health.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
                <li><a href="#comparison" className="hover:text-foreground">Compare</a></li>
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Compliance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-secondary" />WHO-aligned guidance</li>
                <li className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-secondary" />HIPAA & GDPR aware</li>
                <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-secondary" />End-to-end encryption</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Microtest. Screening tool only — not a substitute for clinical diagnosis.</p>
            <p>Built for global health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
