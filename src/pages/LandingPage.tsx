import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Cloud, Terminal, Zap, Shield, Server, Key, Lock,
  FileText, ArrowRight, Menu, X, CheckCircle2,
  Globe, Activity, BookOpen, Github, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── tiny reusable pieces ─── */
function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}

function TerminalLine({ prompt = "$", command, delay = 0, dim = false }: { prompt?: string; command: string; delay?: number; dim?: boolean }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }
  }, [delay]);
  if (!visible) return null;
  return (
    <div className={cn("flex gap-2 font-mono text-sm leading-relaxed", dim ? "text-zinc-500" : "text-zinc-200")}>
      <span className="text-emerald-400 shrink-0">{prompt}</span>
      <span>{command}</span>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Features", "Security", "Docs", "Pricing"];

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "bg-background/90 backdrop-blur border-b shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <Cloud className="h-4 w-4 text-background" />
          </div>
          CloudOne
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/sign-in")}>Login</Button>
          <Button size="sm" onClick={() => navigate("/sign-up")}>Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b px-4 pb-4 space-y-3">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground py-1">{l}</a>
          ))}
          <Separator />
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/sign-in")}>Login</Button>
            <Button size="sm" className="flex-1" onClick={() => navigate("/sign-up")}>Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-8">
          <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1">
            <Activity className="h-3 w-3 text-emerald-500" /> Now in public beta
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
            <GradientText>Access Your Servers</GradientText>
            <br />
            <span className="text-muted-foreground/70">From Anywhere</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            A secure cloud-based terminal to manage servers directly from your browser. No VPN, no client install.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => navigate("/sign-up")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/bash")}>
              <Terminal className="mr-2 h-4 w-4" /> Live Demo
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
            {["No credit card", "Free tier available", "Open source"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — terminal mockup */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-2xl" />
          <div className="relative rounded-xl border bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">ubuntu@prod-server — ssh</span>
            </div>
            {/* Terminal body */}
            <div className="p-5 space-y-2 min-h-[280px]">
              <TerminalLine command="ssh ubuntu@192.168.1.100" />
              <TerminalLine prompt="" command="Welcome to Ubuntu 22.04 LTS" dim delay={400} />
              <TerminalLine command="docker ps" delay={800} />
              <TerminalLine prompt="" command="CONTAINER ID   IMAGE         STATUS" dim delay={1000} />
              <TerminalLine prompt="" command="a1b2c3d4e5f6   nginx:latest  Up 3 days" dim delay={1100} />
              <TerminalLine prompt="" command="b2c3d4e5f6a1   node:18       Up 1 day" dim delay={1200} />
              <TerminalLine command="npm run deploy" delay={1600} />
              <TerminalLine prompt="" command="▶ Building production bundle..." dim delay={2000} />
              <TerminalLine prompt="" command="✓ Deployed to https://app.aitoyz.in" dim delay={2400} />
              <div className="flex gap-2 font-mono text-sm mt-1">
                <span className="text-emerald-400">$</span>
                <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    { icon: Terminal, title: "Web Terminal", desc: "Run commands securely from your browser with real-time SSH sessions. Full xterm.js support with copy/paste." },
    { icon: Zap, title: "High Performance", desc: "Lightning-fast WebSocket connections for instant terminal response. Sub-50ms latency on most connections." },
    { icon: Shield, title: "Secure Access", desc: "Enterprise-grade encryption with SSH key authentication. Your credentials never touch our servers." },
  ];
  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="text-xs">Features</Badge>
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to manage servers</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Built for developers who need reliable, fast, and secure server access without the overhead.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="group border bg-background hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-foreground/5 border flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { icon: Server, step: "01", title: "Add your server", desc: "Securely connect using SSH keys. Supports password and key-based auth." },
    { icon: Globe, step: "02", title: "Open browser terminal", desc: "Access servers instantly from any browser. No client install required." },
    { icon: Activity, step: "03", title: "Manage infrastructure", desc: "Run commands, manage deployments, and monitor your servers in real time." },
  ];
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="text-xs">How it works</Badge>
          <h2 className="text-4xl font-bold tracking-tight">Up and running in minutes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-border" />
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg z-10">
                <Icon className="h-7 w-7" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border text-[10px] font-bold flex items-center justify-center">{step}</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Product Preview ─── */
function ProductPreview() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-xs">Product</Badge>
          <h2 className="text-4xl font-bold tracking-tight">A terminal that feels native</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Full xterm.js rendering, keyboard shortcuts, scrollback buffer — everything you expect from a real terminal.</p>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -inset-6 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
          <div className="relative rounded-2xl border bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-zinc-500 font-mono">CloudOne — prod-server-01</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-500">connected</span>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-1.5 font-mono text-sm min-h-[320px]">
              <div className="text-zinc-500 text-xs mb-4">Last login: Mon Jan 13 09:42:11 2025 from 203.0.113.42</div>
              <TerminalLine command="ssh ubuntu@prod-server-01" />
              <TerminalLine prompt="" command="Connected to prod-server-01 (Ubuntu 22.04)" dim delay={300} />
              <div className="h-2" />
              <TerminalLine command="docker ps --format 'table {{.Names}}\t{{.Status}}'" delay={600} />
              <TerminalLine prompt="" command="NAMES                STATUS" dim delay={900} />
              <TerminalLine prompt="" command="nginx-proxy          Up 12 days" dim delay={1000} />
              <TerminalLine prompt="" command="app-backend          Up 3 days" dim delay={1100} />
              <TerminalLine prompt="" command="postgres-db          Up 3 days" dim delay={1200} />
              <div className="h-2" />
              <TerminalLine command="npm run deploy -- --env production" delay={1600} />
              <TerminalLine prompt="" command="  ✓ Build complete  (12.4s)" dim delay={2200} />
              <TerminalLine prompt="" command="  ✓ Pushed to registry" dim delay={2500} />
              <TerminalLine prompt="" command="  ✓ Container restarted" dim delay={2800} />
              <TerminalLine prompt="" command="  → https://app.aitoyz.in" dim delay={3000} />
              <div className="flex gap-2 mt-2">
                <span className="text-emerald-400">$</span>
                <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Security ─── */
function Security() {
  const items = [
    { icon: Key, label: "SSH Key Authentication", desc: "RSA, Ed25519, ECDSA key support. Password auth optional." },
    { icon: Lock, label: "Encrypted WebSocket", desc: "TLS 1.3 end-to-end encryption on all terminal sessions." },
    { icon: Activity, label: "Session Management", desc: "View, audit, and terminate active sessions at any time." },
    { icon: FileText, label: "Audit Logs", desc: "Full command history and session logs for compliance." },
  ];
  return (
    <section id="security" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-xs">Security</Badge>
            <h2 className="text-4xl font-bold tracking-tight leading-tight">Built secure from the ground up</h2>
            <p className="text-muted-foreground leading-relaxed">
              Security isn't an afterthought. Every connection is encrypted, every session is audited, and your SSH keys never leave your machine.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["SOC 2 Ready", "Zero Trust", "Open Source", "Self-hostable"].map(b => (
                <Badge key={b} variant="secondary" className="text-xs px-3 py-1">{b}</Badge>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map(({ icon: Icon, label, desc }) => (
              <Card key={label} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-5 space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-foreground/5 border flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Start Managing Your Servers<br />
            <span className="text-muted-foreground/60">in the Browser</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join developers who've ditched the VPN. Free tier available, no credit card required.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="gap-2 px-8" onClick={() => navigate("/sign-up")}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8">
            <BookOpen className="h-4 w-4" /> View Documentation
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Free tier includes 2 servers and 5 hours/month of terminal time.
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Security", "Pricing", "Changelog"] },
    { title: "Developers", links: ["Docs", "API Reference", "GitHub", "Status"] },
    { title: "Company", links: ["About", "Blog", "Contact", "Privacy"] },
  ];
  return (
    <footer className="border-t bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
                <Cloud className="h-3.5 w-3.5 text-background" />
              </div>
              CloudOne
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Secure browser-based SSH terminal for modern infrastructure teams.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          {/* Link cols */}
          {cols.map(col => (
            <div key={col.title} className="space-y-4">
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                      {l}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>© 2025 CloudOne. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
const LandingPage = () => (
  <div className="min-h-screen bg-background text-foreground antialiased">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <ProductPreview />
    <Security />
    <CTA />
    <Footer />
  </div>
);

export default LandingPage;
