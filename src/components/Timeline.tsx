import React from "react";
import { ActivityCard } from "@/components/ActivityCard";
import { Activity } from "@/types";

interface TimelineProps {
  activities: Activity[];
  activeActivityId?: string;
  onActivityHover?: (id: string | null) => void;
}

const parseTimeValue = (timeStr: string) => {
  const dayMatch = timeStr.match(/Day (\d+)/i);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 0;
  
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 0;
  let minutes = 0;
  
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  // Return minutes from an arbitrary epoch (Day 0, 00:00)
  return day * 24 * 60 + hours * 60 + minutes;
};

export const Timeline: React.FC<TimelineProps> = ({
  activities,
  activeActivityId,
  onActivityHover,
}) => {
  // Sort activities chronologically by parsed time value
  const sortedActivities = [...activities].sort((a, b) => 
    parseTimeValue(a.start_time || "") - parseTimeValue(b.start_time || "")
  );

  // Group by "Day X"
  const groupedActivities = sortedActivities.reduce((acc, activity) => {
    const match = activity.start_time?.match(/(Day \d+)/i);
    const dayLabel = match ? match[1] : "Day 1";
    if (!acc[dayLabel]) acc[dayLabel] = [];
    acc[dayLabel].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  // Ensure "Day 1", "Day 2" order
  const sortedDays = Object.keys(groupedActivities).sort();

  return (
    <section className="w-full md:w-[40%] h-full overflow-y-auto hide-scrollbar bg-surface px-8 pb-32">
      {sortedDays.map((dayLabel) => {
        const dayActivities = groupedActivities[dayLabel];
        
        return (
          <div key={dayLabel} className="mb-12 relative">
            {/* Sticky Day Header */}
            <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-sm py-8 mb-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="label-sm text-primary font-bold tracking-[0.2em] uppercase text-[10px]">Current Progress</span>
                  <h2 className="text-2xl font-bold text-on-surface leading-tight capitalize">
                    {dayLabel} Itinerary
                  </h2>
                </div>
                <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[12px] font-bold">
                  {dayActivities.length} Activities
                </div>
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="relative ml-4">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/30 via-primary/10 to-transparent ml-[11px]" />

              {dayActivities.map((activity) => (
                <div
                  key={activity.id}
                  onMouseEnter={() => onActivityHover?.(activity.id)}
                  onMouseLeave={() => onActivityHover?.(null)}
                  className="animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${dayActivities.indexOf(activity) * 100}ms` }}
                >
                  <ActivityCard
                    activity={activity}
                    isActive={activeActivityId === activity.id}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};
