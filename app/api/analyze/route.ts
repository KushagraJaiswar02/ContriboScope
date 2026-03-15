import { NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/github/analyzer';
import { lingo } from '@/lib/lingo';
import { GoogleGenAI } from '@google/genai';
import { cache } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const { url, language = "en" } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Parse URL
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
        }

        const [, owner, repo] = match;
        const cacheKey = `analyze:${owner}:${repo}:${language}`;

        // 1. Check Cache
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            console.log(`✅ [Analyze] Cache hit for ${cacheKey}`);
            return NextResponse.json({ ...cached, cached: true });
        }

        // 2. Get raw metrics (now parallelized inside lib/github/analyzer.ts)
        const metrics = await analyzeRepository(owner, repo);

        const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
        });

        // 3. Generate AI Summary
        const prompt = `You are an Open Source Mentor. Analyze repository health metrics and provide a 2-3 sentence 'Contribution Readiness Report'.
Inputs:
Bus Factor: ${metrics.busFactor.coreContributors}
Maintainer Response Time: ${metrics.maintainerActivity.averageResponseTimeHours} hours
Documentation Score: ${metrics.friendliness.score}/3
Instructions:
1. If the Bus Factor is below 3, warn the user about project stability.
2. If response times are over 7 days, set expectations for a slow review.
3. Use an encouraging but honest tone. 
4. Output your response in plain English.`;

        let aiSummary = "";
        try {
            const response = await genAI.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt
            });
            aiSummary = response.text || "";
        } catch (e: any) {
            console.error("⚠️ [Analyze] Gemini failed or Quota hit. Using fallback summary.", e.message);
            aiSummary = `This repository has a ${metrics.busFactor.riskLevel.toLowerCase()} contributor risk and ${metrics.maintainerActivity.speedRating.toLowerCase()} maintainer activity. Check the metrics below for details.`;
        }

        // 4. Translate using Lingo.dev
        const translatedSummary = await lingo.localizeText(aiSummary, language);

        const responseData = {
            owner,
            repo,
            metrics,
            summary: translatedSummary,
            language
        };

        // 5. Store in Cache (24 hours)
        await cache.set(cacheKey, responseData, 86400);

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze repository" }, { status: 500 });
    }
}
