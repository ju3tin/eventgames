import { NextResponse } from "next/server";

export type GitHubMilestone = {
  id: number;
  number: number;
  title: string;
  description: string | null;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  due_on: string | null;
  closed_at: string | null;
  open_issues: number;
  closed_issues: number;
};

export async function GET() {
 // const owner = process.env.GITHUB_OWNER;
 // const repo = process.env.GITHUB_REPO;
/*
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing repo configuration" },
      { status: 500 }
    );
  }
*/
  try {
    const response = await fetch(
      `https://api.github.com/repos/ju3tin/eventgames/milestones?state=all`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch milestones" },
        { status: response.status }
      );
    }

    const data: GitHubMilestone[] = await response.json();

    // Optional: Add computed progress
    const milestones = data.map((m) => {
      const total = m.open_issues + m.closed_issues;
      const progress = total === 0
        ? 0
        : Math.round((m.closed_issues / total) * 100);

      return {
        ...m,
        progress,
      };
    });

    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}