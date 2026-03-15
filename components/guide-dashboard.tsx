'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileCode, AlertCircle, Wrench, GitCommit,
  Search, CheckCircle2, Lightbulb, ShieldAlert, Compass, Globe, Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'pt', label: '🇧🇷 Portuguese' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'ru', label: '🇷🇺 Russian' },
  { code: 'tr', label: '🇹🇷 Turkish' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'nl', label: '🇳🇱 Dutch' },
  { code: 'pl', label: '🇵🇱 Polish' },
  { code: 'vi', label: '🇻🇳 Vietnamese' },
  { code: 'id', label: '🇮🇩 Indonesian' },
  { code: 'bn', label: '🇧🇩 Bengali' },
];

interface RoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
}

interface GuideData {
  the_problem_simply: string;
  why_it_is_tricky: string;
  real_difficulty: number;
  required_skills: string[];
  files_to_touch: string[];
  the_roadmap: RoadmapStep[];
}

interface ApiResponse {
  guide: GuideData;
  issue?: { title: string; labels: string[] };
  owner: string;
  repo: string;
  issueNumber: string;
}

function getDifficultyMeta(score: number): { label: string; color: string; bar: string } {
  if (score <= 3) return { label: 'Beginner', color: 'text-emerald-600', bar: 'bg-emerald-500' };
  if (score <= 5) return { label: 'Moderate', color: 'text-yellow-600', bar: 'bg-yellow-500' };
  if (score <= 7) return { label: 'Intermediate', color: 'text-orange-600', bar: 'bg-orange-500' };
  return { label: 'Advanced', color: 'text-red-600', bar: 'bg-red-500' };
}

export function GuideDashboard() {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<string>(
    typeof window !== 'undefined' ? (localStorage.getItem('appLang') || 'en') : 'en'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
      analyzeUrl(urlParam, language);
    }
  }, [searchParams]);

  const analyzeUrl = async (targetUrl: string, targetLang: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      localStorage.setItem('appLang', targetLang);
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, language: targetLang }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate guide');

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    await analyzeUrl(url, language);
  };

  const guide = result?.guide;

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4">

      {/* ── Input Card ───────────────────────────────────────── */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 shadow-2xl overflow-visible">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
               <Target className="w-6 h-6" />
             </div>
             <div>
               <CardTitle className="text-2xl text-white">Issue Roadmap</CardTitle>
               <CardDescription className="text-slate-400">
                 Paste any GitHub Issue URL to unlock a localized step-by-step roadmap.
               </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  placeholder="https://github.com/shadcn-ui/ui/issues/123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600"
                  required
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-12 min-w-[180px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </span>
                ) : 'Unlock Guide'}
              </Button>
            </div>
          </form>
          {error && <p className="text-red-400 mt-4 text-sm font-medium animate-in fade-in slide-in-from-top-2">{error}</p>}
        </CardContent>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {guide && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">

          {/* 1 ── "High-Level Context" */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border-indigo-500/20 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Lightbulb className="w-5 h-5" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Problem Summary</h2>
              </div>
              <div className="space-y-6">
                <p className="text-2xl leading-tight font-bold text-slate-100">
                  {guide.the_problem_simply}
                </p>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <ShieldAlert className="w-4 h-4 mt-1 text-slate-500 shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    <span className="font-bold text-slate-300 not-italic uppercase text-[10px] mr-2">The Challenge:</span>
                    {guide.why_it_is_tricky}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2 ── Two-column: Sidebar + Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* ── Left Sidebar ─────────────────────────────── */}
            <div className="md:col-span-1 space-y-8">

              {/* Reality Check */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Complexity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-4xl font-black tabular-nums transition-colors ${getDifficultyMeta(guide.real_difficulty).color}`}>
                      {guide.real_difficulty}
                      <span className="text-sm font-medium text-slate-600">/10</span>
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getDifficultyMeta(guide.real_difficulty).color, "border-current")}>
                      {getDifficultyMeta(guide.real_difficulty).label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getDifficultyMeta(guide.real_difficulty).bar}`}
                      style={{ width: `${guide.real_difficulty * 10}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Open These Files */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Orientation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {guide.files_to_touch.map((file: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-xs text-slate-400 p-3 rounded-lg bg-white/5 border border-white/5 font-mono group hover:bg-white/10 hover:border-white/10 transition-all">
                        <FileCode className="w-4 h-4 text-blue-500/70 group-hover:text-blue-400 transition-colors" />
                        <span className="truncate">{file}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Required Skills */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Prerequisites
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {guide.required_skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 text-slate-300 text-[10px] font-bold uppercase transition-all hover:bg-white/10">
                      {skill}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Roadmap (right) ─────────────────────────── */}
            <Card className="md:col-span-2 bg-slate-900/50 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-white font-bold">
                  <GitCommit className="w-5 h-5 text-blue-500" />
                  Technical Roadmap
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Strategic execution steps localized by ContriboScope.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="relative space-y-10 pl-8 sm:pl-12 before:absolute before:left-4 sm:before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                  {guide.the_roadmap.map((step: RoadmapStep, idx: number) => (
                    <div key={idx} className="relative group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                      {/* Step bubble */}
                      <div className="absolute -left-12 sm:-left-16 top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-4 border-slate-950 bg-slate-900 group-hover:bg-blue-600 transition-all duration-300 shadow-2xl z-10">
                        <span className="text-blue-500 group-hover:text-white font-black text-sm">{step.stepNumber}</span>
                      </div>
                      <div className="pt-1">
                        <h4 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-prose">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
