"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Activity, Users, FileCheck, Loader2, Sparkles, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepositoryMetrics } from "@/lib/github/analyzer";

interface AnalyzeResponse {
    owner: string;
    repo: string;
    metrics: RepositoryMetrics;
    summary: string;
    language: string;
    error?: string;
}

export default function AnalyzePage() {
    const [url, setUrl] = useState("");
    const [language, setLanguage] = useState("en");

    const analyzeMutation = useMutation({
        mutationFn: async (data: { url: string; language: string }) => {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to analyze repository");
            }
            return response.json() as Promise<AnalyzeResponse>;
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        analyzeMutation.mutate({ url, language });
    };

    const data = analyzeMutation.data;

    // Helpers for Metric Cards colors
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "Low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "High": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-muted-foreground bg-muted border-border";
        }
    };

    const getSpeedColor = (speed: string) => {
        switch (speed) {
            case "Fast": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "Moderate": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "Slow": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-muted-foreground bg-muted border-border";
        }
    };

    const getFriendlinessColor = (score: number) => {
        if (score === 3) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (score === 2) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-red-500 bg-red-500/10 border-red-500/20";
    }

    return (
        <div className="relative min-h-screen text-slate-50 selection:bg-blue-500/30 hardware-accelerated">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-sm">
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        Intelligence Engine
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                        Repository <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                            Health Analyzer
                        </span>
                    </h1>
                    <p className="max-w-[600px] text-lg text-slate-400">
                        Is this project worth your commute? Scan bus factor, maintainer speed, and documentation health in seconds.
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="max-w-3xl mx-auto bg-slate-900/50 backdrop-blur-xl border-white/10 mb-16 shadow-2xl overflow-visible">
                    <CardContent className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://github.com/facebook/react"
                                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={analyzeMutation.isPending}
                                className="h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
                            >
                                {analyzeMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing
                                    </>
                                ) : (
                                    'Scan Project'
                                )}
                            </button>
                        </form>

                        {analyzeMutation.isError && (
                            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                                {analyzeMutation.error.message}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Area */}
                {data && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">

                        {/* AI Summary Block */}
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20 backdrop-blur-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6 text-blue-400">
                                    <Sparkles className="h-5 w-5" />
                                    <h2 className="text-xl font-bold uppercase tracking-wider text-white">Multilingual Insights</h2>
                                </div>
                                <p className="text-xl leading-relaxed text-slate-200 font-medium">
                                    {data.summary}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 border-t border-white/5 pt-6">
                                    <Languages className="h-3.5 w-3.5 text-blue-500/70" />
                                    Localized for clarity via ContriboScope AI
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Bus Factor Card */}
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Users className="h-4 w-4" />
                                            <span className="font-bold text-xs uppercase tracking-widest">Bus Factor</span>
                                        </div>
                                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getRiskColor(data.metrics.busFactor.riskLevel))}>
                                            {data.metrics.busFactor.riskLevel} Risk
                                        </span>
                                    </div>
                                    <CardTitle>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-white">{data.metrics.busFactor.coreContributors}</span>
                                            <span className="text-sm font-medium text-slate-500">Core Assets</span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        These developers drive 50% of the movement. Sustainability looks 
                                        <span className="text-white font-medium ml-1">{data.metrics.busFactor.riskLevel.toLowerCase()}</span>.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Maintainer Speed Card */}
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Activity className="h-4 w-4" />
                                            <span className="font-bold text-xs uppercase tracking-widest">Responsiveness</span>
                                        </div>
                                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getSpeedColor(data.metrics.maintainerActivity.speedRating))}>
                                            {data.metrics.maintainerActivity.speedRating}
                                        </span>
                                    </div>
                                    <CardTitle>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-white">
                                                {data.metrics.maintainerActivity.averageResponseTimeHours !== null ? `${data.metrics.maintainerActivity.averageResponseTimeHours}h` : 'N/A'}
                                            </span>
                                            <span className="text-sm font-medium text-slate-500">Avg Response</span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Typical review latency for new PRs. Expectations: 
                                        <span className="text-white font-medium ml-1">{data.metrics.maintainerActivity.speedRating.toLowerCase()}</span>.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Friendliness Card */}
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <FileCheck className="h-4 w-4" />
                                            <span className="font-bold text-xs uppercase tracking-widest">Entry Barrier</span>
                                        </div>
                                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getFriendlinessColor(data.metrics.friendliness.score))}>
                                            {data.metrics.friendliness.score}/3 Assets
                                        </span>
                                    </div>
                                    <CardTitle>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-white">Docs</span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">CONTRIBUTING</span>
                                        <span className={cn("font-bold", data.metrics.friendliness.hasContributing ? "text-emerald-500" : "text-slate-700 font-normal")}>
                                            {data.metrics.friendliness.hasContributing ? "READY" : "MISSING"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">TEMPLATES</span>
                                        <span className={cn("font-bold", data.metrics.friendliness.hasIssueTemplates ? "text-emerald-500" : "text-slate-700 font-normal")}>
                                            {data.metrics.friendliness.hasIssueTemplates ? "READY" : "MISSING"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
