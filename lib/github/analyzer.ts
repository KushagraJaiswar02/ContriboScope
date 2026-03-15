import { getOctokit } from "../github";

export interface RepositoryMetrics {
    busFactor: {
        totalContributors: number;
        coreContributors: number; // Number of people making up 50% of commits
        riskLevel: "High" | "Medium" | "Low";
    };
    maintainerActivity: {
        averageResponseTimeHours: number | null; // null if no PRs or responses
        speedRating: "Fast" | "Moderate" | "Slow" | "Unknown";
    };
    friendliness: {
        hasContributing: boolean;
        hasCodeOfConduct: boolean;
        hasIssueTemplates: boolean;
        score: number; // 0 to 3
    };
}

export async function analyzeRepository(owner: string, repo: string, token?: string): Promise<RepositoryMetrics> {
    const dbToken = token || process.env.GITHUB_TOKEN;
    const octokit = getOctokit(dbToken);

    // Run all analysis sections in parallel
    const [busFactorResult, maintainerResult, friendlinessResult] = await Promise.all([
        // 1. Bus Factor
        (async () => {
            const authorCounts: Record<string, number> = {};
            let coreContributors = 0;
            try {
                const commitsResponse = await octokit.rest.repos.listCommits({ owner, repo, per_page: 100 });
                commitsResponse.data.forEach((commit) => {
                    const author = commit.author?.login || commit.commit.author?.name || "Unknown";
                    authorCounts[author] = (authorCounts[author] || 0) + 1;
                });
                const sortedAuthors = Object.entries(authorCounts).sort(([, a], [, b]) => b - a);
                const totalCommits = commitsResponse.data.length;
                const fiftyPercentThreshold = totalCommits / 2;
                let currentCommits = 0;
                for (const [, count] of sortedAuthors) {
                    currentCommits += count;
                    coreContributors++;
                    if (currentCommits >= fiftyPercentThreshold) break;
                }
            } catch (e: any) {
                console.warn("Commits error:", e.message);
                coreContributors = 5; // Fallback
            }
            return {
                totalContributors: Object.keys(authorCounts).length || 5,
                coreContributors,
                riskLevel: (coreContributors <= 1 ? "High" : coreContributors <= 3 ? "Medium" : "Low") as any
            };
        })(),

        // 2. Maintainer Activity
        (async () => {
            let prsWithResponseCount = 0;
            let totalResponseTimeMs = 0;
            try {
                const prsResponse = await octokit.rest.pulls.list({ owner, repo, state: "closed", sort: "updated", direction: "desc", per_page: 10 });
                const prResults = await Promise.all(prsResponse.data.map(async (pr) => {
                    if (!pr.created_at) return { count: 0, time: 0 };
                    try {
                        const [reviews, comments] = await Promise.all([
                            octokit.rest.pulls.listReviews({ owner, repo, pull_number: pr.number, per_page: 10 }),
                            octokit.rest.issues.listComments({ owner, repo, issue_number: pr.number, per_page: 10 })
                        ]);
                        const allResponseTimes = [...reviews.data.map(r => r.submitted_at), ...comments.data.map(c => c.created_at)]
                            .filter((t): t is string => !!t).map(t => new Date(t).getTime());
                        if (allResponseTimes.length > 0) {
                            allResponseTimes.sort((a, b) => a - b);
                            const responseTimeMs = allResponseTimes[0] - new Date(pr.created_at).getTime();
                            if (responseTimeMs > 0) return { count: 1, time: responseTimeMs };
                        }
                    } catch { }
                    return { count: 0, time: 0 };
                }));
                prResults.forEach(r => { totalResponseTimeMs += r.time; prsWithResponseCount += r.count; });
            } catch (e: any) {
                console.warn("PRs error:", e.message);
            }
            const avgHours = prsWithResponseCount > 0 ? (totalResponseTimeMs / prsWithResponseCount) / (1000 * 60 * 60) : null;
            return {
                averageResponseTimeHours: avgHours ? Math.round(avgHours * 10) / 10 : null,
                speedRating: (avgHours ? (avgHours <= 24 ? "Fast" : avgHours <= 72 ? "Moderate" : "Slow") : "Unknown") as any
            };
        })(),

        // 3. Friendliness
        (async () => {
            let hasContributing = false, hasCodeOfConduct = false, hasIssueTemplates = false;
            try {
                const tree = await octokit.rest.git.getTree({ owner, repo, tree_sha: "HEAD", recursive: "true" });
                for (const file of tree.data.tree) {
                    if (!file.path) continue;
                    const path = file.path.toLowerCase();
                    if (path.includes("contributing.md")) hasContributing = true;
                    if (path.includes("code_of_conduct.md")) hasCodeOfConduct = true;
                    if (path.includes("issue_template")) hasIssueTemplates = true;
                }
            } catch { }
            return {
                hasContributing,
                hasCodeOfConduct,
                hasIssueTemplates,
                score: (hasContributing ? 1 : 0) + (hasCodeOfConduct ? 1 : 0) + (hasIssueTemplates ? 1 : 0)
            };
        })()
    ]);

    return {
        busFactor: busFactorResult,
        maintainerActivity: maintainerResult,
        friendliness: friendlinessResult,
    };
}
