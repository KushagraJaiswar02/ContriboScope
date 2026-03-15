import { NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import { GoogleGenAI, Type } from '@google/genai';
import { cache } from '@/lib/redis';

// Map locale codes → language names for the Gemini prompt
const LOCALE_NAMES: Record<string, string> = {
    en: 'English', hi: 'Hindi', fr: 'French', de: 'German',
    es: 'Spanish', pt: 'Portuguese', zh: 'Chinese (Simplified)',
    ja: 'Japanese', ko: 'Korean', ar: 'Arabic', ru: 'Russian',
    tr: 'Turkish', it: 'Italian', nl: 'Dutch', pl: 'Polish',
    vi: 'Vietnamese', id: 'Indonesian', bn: 'Bengali',
};

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: Request) {
    try {
        const { url, language = "en" } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const cacheKey = `guide:${url}:${language}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            console.log(`✅ [Guide] Cache hit for ${cacheKey}`);
            return NextResponse.json({ ...cached, cached: true });
        }

        // 1. Fetch Issue Data
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub Issue URL" }, { status: 400 });
        }

        const [, owner, repo, issueNumber] = match;
        
        // Parallel fetch issue and repo structure
        const [{ data: issue }, { data: repoContent }] = await Promise.all([
            octokit.rest.issues.get({ owner, repo, issue_number: parseInt(issueNumber) }),
            octokit.rest.repos.getContent({ owner, repo, path: "" })
        ]);

        const repoStructure = Array.isArray(repoContent) 
            ? repoContent.map(f => f.name).join(', ') 
            : 'Unable to fetch structure';

        // 2. Generate AI Analysis
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
        });

        const githubLabels = issue.labels.map((l: any) => l.name).join(', ') || 'none';
        const targetLanguageName = LOCALE_NAMES[language] || 'English';

        const prompt = `You are a Senior Open Source Maintainer. Create a contribution roadmap for this issue.
Issue Title: ${issue.title}
Issue Description: ${issue.body}
Labels: ${githubLabels}
Repo Files: ${repoStructure}

Return a JSON object:
{
  "the_problem_simply": "1-sentence summary",
  "why_it_is_tricky": "1-sentence technical challenge",
  "real_difficulty": "Beginner/Intermediate/Advanced",
  "required_skills": ["skill1", "skill2"],
  "files_to_touch": ["file1", "file2"],
  "the_roadmap": [
    { "stepNumber": 1, "title": "Step title", "description": "What to do" }
  ]
}

IMPORTANT: Write all text fields (the_problem_simply, why_it_is_tricky, roadmap titles/descriptions) in ${targetLanguageName}.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                the_problem_simply: { type: Type.STRING },
                why_it_is_tricky: { type: Type.STRING },
                real_difficulty: { type: Type.STRING },
                required_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                files_to_touch: { type: Type.ARRAY, items: { type: Type.STRING } },
                the_roadmap: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            stepNumber: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["stepNumber", "title", "description"]
                    }
                }
            },
            required: ["the_problem_simply", "why_it_is_tricky", "real_difficulty", "required_skills", "files_to_touch", "the_roadmap"]
        };

        // 4. Generate AI Analysis with Fallback
        let aiResult: any = null;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema as any,
                }
            });
            aiResult = JSON.parse(response.text || '{}');
        } catch (e: any) {
            console.error("⚠️ [Guide] Gemini failed or Quota hit. Using fallback guide.", e.message);
            
            // Localized fallback strings (Simplified)
            const fallbackTexts: Record<string, any> = {
                en: {
                    problem: "This issue requires investigation into the repository's codebase.",
                    tricky: "Finding the exact location of the bug or feature implementation.",
                    roadmap: [
                        { stepNumber: 1, title: "Fork & Clone", description: "Fork the repository and clone it to your local machine." },
                        { stepNumber: 2, title: "Explore", description: "Search for keywords related to the issue in the files listed above." },
                        { stepNumber: 3, title: "Replicate", description: "Try to reproduce the problem or verify the needed feature." },
                        { stepNumber: 4, title: "Pull Request", description: "Submit your changes as a Draft PR for maintainer feedback." }
                    ]
                },
                hi: {
                    problem: "इस समस्या के लिए रिपॉजिटरी के कोडबेस की जांच करने की आवश्यकता है।",
                    tricky: "बग या फीचर कार्यान्वयन के सटीक स्थान को खोजना।",
                    roadmap: [
                        { stepNumber: 1, title: "फ़ॉर्क और क्लोन", description: "रिपॉजिटरी को फ़ॉर्क करें और इसे अपने स्थानीय मशीन पर क्लोन करें।" },
                        { stepNumber: 2, title: "अन्वेषण", description: "ऊपर सूचीबद्ध फ़ाइलों में समस्या से संबंधित कीवर्ड खोजें।" },
                        { stepNumber: 3, title: "रिप्लिकेट", description: "समस्या को फिर से उत्पन्न करने या आवश्यक सुविधा को सत्यापित करने का प्रयास करें।" },
                        { stepNumber: 4, title: "पुल रिक्वेस्ट", description: "मेंटेनर फीडबैक के लिए अपने परिवर्तनों को ड्राफ्ट PR के रूप में सबमिट करें।" }
                    ]
                }
            };

            const lang = (language in fallbackTexts) ? language : 'en';
            const f = fallbackTexts[lang];

            aiResult = {
                the_problem_simply: f.problem,
                why_it_is_tricky: f.tricky,
                real_difficulty: "Intermediate",
                required_skills: ["Git", "Code Reading", "GitHub Flow"],
                files_to_touch: repoStructure.split(', ').slice(0, 3),
                the_roadmap: f.roadmap
            };
        }
        
        const responseData = {
            owner,
            repo,
            issueNumber,
            issue: {
                title: issue.title,
                labels: issue.labels.map((l: any) => l.name),
            },
            guide: aiResult,
            language,
            ai_powered: aiResult.real_difficulty !== "Intermediate"
        };

        // 3. Store in Cache (24 hours)
        await cache.set(cacheKey, responseData, 86400);

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error("Guide Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate guide" }, { status: 500 });
    }
}
