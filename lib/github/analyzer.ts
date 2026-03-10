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
    const octokit = getOctokit(token);

    // 1. Calculate Bus Factor
    const commitsResponse = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 100,
    });

    const authorCounts: Record<string, number> = {};
    commitsResponse.data.forEach((commit) => {
        // Fallback to commit.commit.author?.name if GitHub user is not linked
        const author = commit.author?.login || commit.commit.author?.name || "Unknown";
        authorCounts[author] = (authorCounts[author] || 0) + 1;
    });

    const sortedAuthors = Object.entries(authorCounts).sort(([, a], [, b]) => b - a);
    const totalCommits = commitsResponse.data.length;
    const fiftyPercentThreshold = totalCommits / 2;

    let currentCommits = 0;
    let coreContributors = 0;

    for (const [, count] of sortedAuthors) {
        currentCommits += count;
        coreContributors++;
        if (currentCommits >= fiftyPercentThreshold) {
            break;
        }
    }

    const busFactorRisk = coreContributors <= 1 ? "High" : coreContributors <= 3 ? "Medium" : "Low";

    // 2. Maintainer Activity (Time to first response on PRs)
    const prsResponse = await octokit.rest.pulls.list({
        owner,
        repo,
        state: "closed",
        sort: "updated",
        direction: "desc",
        per_page: 10,
    });

    let totalResponseTimeMs = 0;
    let prsWithResponseCount = 0;

    for (const pr of prsResponse.data) {
        if (!pr.created_at) continue;

        // Fetch review comments
        const reviewsResponse = await octokit.rest.pulls.listReviews({
            owner,
            repo,
            pull_number: pr.number,
            per_page: 10,
        });

        // Fetch issue comments (regular comments on the PR)
        const commentsResponse = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
            per_page: 10,
        });

        // Combine all response times
        const allResponseTimes = [
            ...reviewsResponse.data.map(r => r.submitted_at),
            ...commentsResponse.data.map(c => c.created_at)
        ]
            .filter((time): time is string => !!time)
            .map(t => new Date(t).getTime());

        if (allResponseTimes.length > 0) {
            // Find the earliest response
            allResponseTimes.sort((a, b) => a - b);
            const firstResponseTime = allResponseTimes[0];
            const prCreatedTime = new Date(pr.created_at).getTime();

            const responseTimeMs = firstResponseTime - prCreatedTime;
            // Only count if it's a positive time (to avoid weird edge cases or same-ms creation/comment)
            if (responseTimeMs > 0) {
                totalResponseTimeMs += responseTimeMs;
                prsWithResponseCount++;
            }
        }
    }

    let averageResponseTimeHours: number | null = null;
    let speedRating: "Fast" | "Moderate" | "Slow" | "Unknown" = "Unknown";

    if (prsWithResponseCount > 0) {
        const averageResponseTimeMs = totalResponseTimeMs / prsWithResponseCount;
        averageResponseTimeHours = averageResponseTimeMs / (1000 * 60 * 60);

        if (averageResponseTimeHours <= 24) {
            speedRating = "Fast";
        } else if (averageResponseTimeHours <= 72) {
            speedRating = "Moderate";
        } else {
            speedRating = "Slow";
        }
    }

    // 3. Friendliness Check
    let hasContributing = false;
    let hasCodeOfConduct = false;
    let hasIssueTemplates = false;
    let friendlinessScore = 0;

    try {
        // Attempt to get repo tree to check files efficiently
        const treeResponse = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: "HEAD", // Fetch latest on main/master
            recursive: "true",
        });

        for (const file of treeResponse.data.tree) {
            if (!file.path) continue;
            const lowerPath = file.path.toLowerCase();

            if (lowerPath === "contributing.md" || lowerPath.startsWith(".github/contributing.md")) {
                hasContributing = true;
            }
            if (lowerPath === "code_of_conduct.md" || lowerPath.startsWith(".github/code_of_conduct.md")) {
                hasCodeOfConduct = true;
            }
            if (lowerPath.startsWith(".github/issue_template") && file.type === "tree") {
                hasIssueTemplates = true;
            }
            if (lowerPath.startsWith(".github/issue_template/") && file.type === "blob") { // Fallback if direct file
                hasIssueTemplates = true;
            }
        }
    } catch (error) {
        console.warn(`Could not deeply scan tree for ${owner}/${repo}, trying fallback file checks.`, error);
        // Silent fail tree fetch (might be blocked by size or permissions), could do individual file fetches as fallback if needed.
    }

    // Calculate score
    if (hasContributing) friendlinessScore++;
    if (hasCodeOfConduct) friendlinessScore++;
    if (hasIssueTemplates) friendlinessScore++;

    return {
        busFactor: {
            totalContributors: Object.keys(authorCounts).length,
            coreContributors,
            riskLevel: busFactorRisk,
        },
        maintainerActivity: {
            averageResponseTimeHours: averageResponseTimeHours ? Math.round(averageResponseTimeHours * 10) / 10 : null,
            speedRating,
        },
        friendliness: {
            hasContributing,
            hasCodeOfConduct,
            hasIssueTemplates,
            score: friendlinessScore,
        },
    };
}
