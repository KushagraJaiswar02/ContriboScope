"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Activity, Users, FileCheck, Loader2, Sparkles, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">

            {/* Exquisite Header Background */}
            <div className="absolute inset-0 top-0 light:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] h-[400px] pointer-events-none -z-10" />

            <main className="container max-w-5xl mx-auto px-4 py-16 sm:py-24">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                        <Sparkles className="mr-2 h-4 w-4" />
                        ContriboScope Analyzer
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
                        Instantly measure <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                            Repository Health
                        </span>
                    </h1>
                    <p className="max-w-[600px] text-lg text-muted-foreground">
                        Paste a GitHub URL to analyze the bus factor, maintainer responsiveness, and friendliness of any open-source project.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto relative z-10 mb-16">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://github.com/facebook/react"
                                className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm placeholder:text-muted-foreground/60 text-lg"
                                required
                            />
                        </div>

                        <div className="relative isolate group">
                            <Languages className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="h-14 pl-10 pr-8 rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm appearance-none min-w-[120px]"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={analyzeMutation.isPending}
                            className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary/20"
                        >
                            {analyzeMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing
                                </>
                            ) : (
                                'Analyze'
                            )}
                        </button>
                    </form>

                    {analyzeMutation.isError && (
                        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                            {analyzeMutation.error.message}
                        </div>
                    )}
                </div>

                {/* Results Area */}
                {data && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both">

                        {/* AI Summary Block */}
                        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <Sparkles className="h-5 w-5" />
                                <h2 className="text-xl font-semibold text-foreground">AI Health Summary</h2>
                            </div>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {data.summary}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60 border-t pt-4">
                                <Languages className="h-3 w-3" />
                                Translated to {language.toUpperCase()} with Lingo.dev
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Bus Factor Card */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col hover:border-border/80 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium text-sm">Bus Factor</span>
                                    </div>
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getRiskColor(data.metrics.busFactor.riskLevel))}>
                                        {data.metrics.busFactor.riskLevel} Risk
                                    </span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold tracking-tight text-foreground">{data.metrics.busFactor.coreContributors}</span>
                                        <span className="text-sm text-muted-foreground">core devs</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        make up 50% of the last 100 commits (out of {data.metrics.busFactor.totalContributors} total contributors).
                                    </p>
                                </div>
                            </div>

                            {/* Maintainer Speed Card */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col hover:border-border/80 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                        <span className="font-medium text-sm">Maintainer Speed</span>
                                    </div>
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getSpeedColor(data.metrics.maintainerActivity.speedRating))}>
                                        {data.metrics.maintainerActivity.speedRating}
                                    </span>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold tracking-tight text-foreground">
                                            {data.metrics.maintainerActivity.averageResponseTimeHours !== null ? `${data.metrics.maintainerActivity.averageResponseTimeHours}h` : 'N/A'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Average time to first maintainer response on recently closed Pull Requests.
                                    </p>
                                </div>
                            </div>

                            {/* Friendliness Card */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col hover:border-border/80 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <FileCheck className="h-4 w-4" />
                                        <span className="font-medium text-sm">Onboarding</span>
                                    </div>
                                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getFriendlinessColor(data.metrics.friendliness.score))}>
                                        {data.metrics.friendliness.score}/3 Score
                                    </span>
                                </div>

                                <div className="mt-auto space-y-3 shrink-0">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">CONTRIBUTING.md</span>
                                        {data.metrics.friendliness.hasContributing ? <span className="text-emerald-500 font-medium">Yes</span> : <span className="text-red-500/80 font-medium">No</span>}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">CODE_OF_CONDUCT.md</span>
                                        {data.metrics.friendliness.hasCodeOfConduct ? <span className="text-emerald-500 font-medium">Yes</span> : <span className="text-red-500/80 font-medium">No</span>}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Issue Templates</span>
                                        {data.metrics.friendliness.hasIssueTemplates ? <span className="text-emerald-500 font-medium">Yes</span> : <span className="text-red-500/80 font-medium">No</span>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
