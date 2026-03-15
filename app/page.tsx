import Link from 'next/link';
import { Search, Target, Compass, ArrowRight, Github, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center hardware-accelerated">
      
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative w-full py-20 px-4 flex flex-col items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-10 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] -z-10" />
        
        <div className="max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Open Source Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            Master Open Source in <br />
            <span className="text-blue-500">Your Native Language</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop wasting time on dead repos and confusing issues. Get AI-powered clarity, 
            step-by-step roadmaps, and personalized recommendations.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-base font-semibold shadow-lg shadow-blue-500/20 group">
              Get Started Free 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white text-base font-semibold">
              <Github className="mr-2 w-5 h-5" />
              Star on GitHub
            </Button>
          </div>
        </div>

        {/* Stats / Proof */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden">
           <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">20+</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">Languages</span>
           </div>
           <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-bold text-white">Gemini</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">Powering Guidance</span>
           </div>
           <div className="flex flex-col items-center gap-1 text-center font-bold">
              <span className="text-2xl font-bold text-white">Redis</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">Lightning Fast</span>
           </div>
           <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-bold text-white">Docker</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">Self-Hosted</span>
           </div>
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────── */}
      <section id="features" className="w-full max-w-7xl px-4 py-24 mx-auto border-t border-white/5">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Choose Your Path</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Three core engines designed to take you from discovery to your first merged PR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Analyze */}
          <Link href="/analyze" className="group">
            <Card className="h-full bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Search className="w-24 h-24 text-blue-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-white">🔍 Analyze</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Is this repo worth your time?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Deep-scan any repository for Bus Factor, maintainer responsiveness, 
                  and documentation health before you commit.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-blue-400/80 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Health Sustainability Report
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-blue-400/80 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    Responsiveness Predictions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Guide */}
          <Link href="/guide" className="group">
            <Card className="h-full bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Target className="w-24 h-24 text-indigo-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-white">🎯 Guide</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Get a localized roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Stuck on an issue? Get a step-by-step roadmap and file orientation 
                  tailored to your native language.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-400/80 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Multi-step Thinking Guide
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-400/80 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    File Orientation Map
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Discover */}
          <Link href="/discover" className="group">
            <Card className="h-full bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Compass className="w-24 h-24 text-purple-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-white">✨ Discover</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Your personalized feed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Don't know where to start? Get high-impact issue recommendations 
                  matched to your tech stack and experience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-purple-400/80 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Skill-Based Matching
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-purple-400/80 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    Localized Match Reasons
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="w-full py-12 px-4 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">
          Built with ❤️ for the Multilingual Open Source Hackathon. Powered by <span className="text-blue-400">Gemini</span> & <span className="text-indigo-400">Lingo.dev</span>.
        </p>
      </footer>

    </div>
  );
}
