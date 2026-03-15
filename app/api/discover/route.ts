import { NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import { GoogleGenAI, Type } from '@google/genai';
import { lingo } from '@/lib/lingo';
import { supabase } from '@/lib/supabase';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cache } from '@/lib/redis';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { preferences } = await request.json();
        const githubId = (session as any).user.id || session.user.email;

        // Upsert to Supabase
        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                github_id: githubId,
                stack: preferences.stack,
                experience: preferences.experience,
                available_time: preferences.available_time,
                work_type: preferences.work_type,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'github_id' });

        if (error) console.error("Supabase Error:", error);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Discover PUT Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const language = searchParams.get('language') || 'en';
        const stackFilter = searchParams.get('stack') || 'typescript,react';
        
        const session = await getServerSession(authOptions);
        const userId = session?.user ? ((session as any).user.id || session.user.email) : 'anonymous';
        const cacheKey = `discover:feed:${userId}:${stackFilter}:${language}`;

        // 1. Check Cache
        if (userId !== 'anonymous') {
            const cached = await cache.get<any>(cacheKey);
            if (cached) {
                console.log(`✅ [Discover] Cache hit for ${userId}`);
                return NextResponse.json({ ...cached, cached: true });
            }
        }

        // 2. Search GitHub for Good First Issues
        const primaryTech = stackFilter.split(',')[0] || 'typescript';
        const q = `label:"good first issue" state:open is:issue language:${primaryTech}`.slice(0, 256);
        
        const { data: searchResults } = await octokit.search.issuesAndPullRequests({
            q,
            sort: 'created',
            order: 'desc',
            per_page: 15,
        });

        const issues = searchResults.items.map((item: any) => ({
            title: item.title,
            url: item.html_url,
            repository: (item as any).repository_url.split('/').slice(-2).join('/'),
            labels: item.labels.map((l: any) => l.name),
            body: (item.body || '').slice(0, 500),
        }));

        // 3. Score & Explain with AI
        const prompt = `Analyze these GitHub issues and match them to a user with these preferences:
Stack: ${stackFilter}

Issues:
${JSON.stringify(issues, null, 2)}

For each issue, provide:
1. A "match_score" (0-100)
2. A "match_reason" (1 sentence in English)

Return exactly 10 issues in a JSON array.`;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    repository: { type: Type.STRING },
                    match_score: { type: Type.INTEGER },
                    match_reason: { type: Type.STRING },
                    labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "url", "repository", "match_score", "match_reason", "labels"]
            }
        };

        let scoredIssues = [];
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema as any,
                },
            });
            scoredIssues = JSON.parse(response.text || '[]');
        } catch (e: any) {
            console.error("⚠️ [Discover] Gemini failed or Quota hit. Using fallback scoring.", e.message);
            // Fallback: Use raw issues with generic scores
            scoredIssues = issues.slice(0, 10).map(issue => ({
                ...issue,
                match_score: 75,
                match_reason: "Recommended based on your primary tech stack."
            }));
        }

        // 4. Localize Match Reasons
        const localizedIssues = await Promise.all(scoredIssues.map(async (issue: any) => {
            try {
                const localizedReason = await lingo.localizeText(issue.match_reason, language);
                return { ...issue, match_reason: localizedReason };
            } catch (err) {
                return issue; // Fallback to English reason
            }
        }));

        const responseData = { 
            issues: localizedIssues,
            ai_powered: scoredIssues.some((i: any) => i.match_score !== 75)
        };

        // 5. Cache Results (Increased to 6 hours to conserve quota)
        if (userId !== 'anonymous') {
            await cache.set(cacheKey, responseData, 21600);
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error("Discover GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
