type Milestone = {
    id: number;
    title: string;
    description: string | null;
    state: "open" | "closed";
    due_on: string | null;
    progress: number;
  };
  
  type Props = {
    milestones: Milestone[];
  };
  
  export default function MilestoneTimeline({ milestones }: Props) {
    return (
      <div className="relative border-l border-gray-300 ml-4">
        {milestones.map((m) => (
          <div key={m.id} className="mb-10 ml-6 relative">
            {/* Dot */}
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${
                m.state === "closed" ? "bg-green-500" : "bg-blue-500"
              }`}
            />
  
            {/* Content */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{m.title}</h3>
  
              {m.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {m.description}
                </p>
              )}
  
              <div className="mt-3 text-sm text-gray-500">
                {m.due_on && (
                  <p>Due: {new Date(m.due_on).toLocaleDateString()}</p>
                )}
                <p>Status: {m.state}</p>
              </div>
  
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className={`h-2 rounded ${
                      m.state === "closed"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <p className="text-xs mt-1">{m.progress}% complete</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }