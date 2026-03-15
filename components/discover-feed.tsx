'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPreferences } from './onboarding-wizard';
import { ExternalLink, ArrowRight, GitBranch, RefreshCcw, Compass } from 'lucide-react';
import Link from 'next/link';

interface Issue {
  title: string;
  url: string;
  repository: string;
  match_score: number;
  match_reason: string;
  labels: string[];
}

interface DiscoverFeedProps {
  preferences: UserPreferences;
  onReset: () => void;
}

export function DiscoverFeed({ preferences, onReset }: DiscoverFeedProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, [preferences]);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const lang = localStorage.getItem('appLang') || 'en';
      const stack = preferences.stack.join(',').toLowerCase();
      
      const res = await fetch(`/api/discover?language=${lang}&stack=${stack}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch issues');
      
      const sorted = (data.issues || []).sort((a: Issue, b: Issue) => b.match_score - a.match_score);
      setIssues(sorted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
  };

  if (loading) {
    return (
      <div className="space-y-6 py-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-white/5 rounded-2xl animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5 py-12 text-center backdrop-blur-xl">
        <p className="text-red-400 font-bold mb-6">{error}</p>
        <Button onClick={fetchIssues} variant="outline" className="border-white/10 hover:bg-white/10 text-white">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry Discovery
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Intelligence Feed</h2>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={fetchIssues} disabled={loading} className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5">
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Sync Results
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5">
             Refine Stack
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {issues.map((issue, idx) => (
          <Card key={idx} className="group hover:border-purple-500/50 transition-all duration-300 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border-white/10">
            <div className="flex flex-col md:flex-row">
              <div className={cn(
                "md:w-32 flex flex-col items-center justify-center py-8 px-4 border-b md:border-b-0 md:border-r border-white/5 whitespace-nowrap group-hover:bg-white/5 transition-colors",
                getScoreColor(issue.match_score)
              )}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Match</span>
                <span className="text-4xl font-black">{issue.match_score}%</span>
              </div>

              <div className="flex-1 p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <GitBranch className="w-3.5 h-3.5 text-purple-500/70" />
                    {issue.repository}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors pr-12 relative leading-tight">
                    {issue.title}
                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="absolute right-0 top-0.5 p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-white/5">
                  <p className="text-base font-medium text-slate-200 leading-relaxed italic">
                    "{issue.match_reason}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.slice(0, 3).map((label, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-white/5 border-white/10 text-slate-400">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  
                  <Link href={`/guide?url=${encodeURIComponent(issue.url)}`} passHref>
                    <Button size="lg" className="h-10 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                      Explore Roadmap
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {issues.length === 0 && (
          <Card className="text-center py-20 bg-slate-900/50 border-white/10 border-dashed border-2">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active matches found for your current profile.</p>
            <Button onClick={onReset} variant="link" className="text-purple-400 mt-2">Adjust your stack to expand results</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper utility for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
