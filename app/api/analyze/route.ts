import { NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/github/analyzer';
import { lingo } from '@/lib/lingo';
import OpenAI from 'openai';

// Assuming you add OPENAI_API_KEY to your .env.local
// Instantiation moved inside POST handler to prevent build errors

export async function POST(request: Request) {
    try {
        const { url, language = "en" } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Parse URL (e.g., https://github.com/facebook/react)
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
        }

        const [, owner, repo] = match;

        // 1. Get raw metrics
        // Pass session token if you implement passing it from the frontend to avoid rate limits
        const metrics = await analyzeRepository(owner, repo);

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
        });

        // 2. Generate AI Summary using OpenAI
        const prompt = `
      You are a wise open-source mentor. I have analyzed the repository ${owner}/${repo}.
      Here are the metrics:
      - Bus Factor: ${metrics.busFactor.coreContributors} core contributors make up 50% of the commits (Risk: ${metrics.busFactor.riskLevel}).
      - Maintainer speed: ${metrics.maintainerActivity.speedRating} (Average response: ${metrics.maintainerActivity.averageResponseTimeHours} hours).
      - Friendliness score: ${metrics.friendliness.score}/3 (Contributing: ${metrics.friendliness.hasContributing}, Conduct: ${metrics.friendliness.hasCodeOfConduct}, Templates: ${metrics.friendliness.hasIssueTemplates}).
      
      Provide a plain-language health summary of this repository for a potential contributor. Keep it to a maximum of 3 sentences. Be encouraging but honest about the risks. 
    `;

        let aiSummary = "Summary generation failed.";
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4o-mini",
            });
            aiSummary = completion.choices[0]?.message?.content || aiSummary;
        } catch (e: any) {
            console.error("OpenAI Error", e);
            // Fallback or ignore in case no key is provided during day 1/2 demo
            aiSummary = `The repository has a ${metrics.busFactor.riskLevel} contributor risk, and ${metrics.maintainerActivity.speedRating.toLowerCase()} maintainer response times. It scored ${metrics.friendliness.score}/3 on friendliness indicators.`;
        }

        // 3. Translate using Lingo.dev (mocked)
        const translatedSummary = await lingo.localizeText(aiSummary, language);

        return NextResponse.json({
            owner,
            repo,
            metrics,
            summary: translatedSummary,
            language
        });
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze repository" }, { status: 500 });
    }
}
