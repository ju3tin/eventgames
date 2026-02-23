'use client';
import MilestoneTimeline from "@/components/MilestoneTimeline";

async function getMilestones() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/milestones`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch milestones");
  }

  return res.json();
}

export default async function Page() {
  const milestones = await getMilestones();

  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">
        Project Timeline
      </h1>

      <MilestoneTimeline milestones={milestones} />
    </main>
  );
}