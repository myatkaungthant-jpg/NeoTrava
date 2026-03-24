import { useState } from "react";
import { ConciergeHeader } from "@/components/ConciergeHeader";
import { Timeline } from "@/components/Timeline";
import { InteractiveMap } from "@/components/InteractiveMap";
import { Activity, Trip } from "@/types";
import { EmptyState } from "./EmptyState";

interface DashboardClientProps {
  trip: Trip | null;
  activities: Activity[];
}

export default function DashboardClient({ trip, activities }: DashboardClientProps) {
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  const totalCost = activities.reduce((sum, activity) => sum + (activity.cost_thb || 0), 0);

  if (!trip || activities.length === 0) {
    return (
      <main className="h-screen flex flex-col bg-background">
        <ConciergeHeader trip={trip} totalCost={totalCost} />
        <div className="flex-1 pt-[88px] flex">
          <EmptyState 
            title={!trip ? "Trip Not Found" : "No Activities Planned"}
            subtitle={!trip ? "The journey you're looking for doesn't exist or has been archived." : "This trip is currently an empty canvas. Let's add some signature experiences."}
            actionLabel={!trip ? "Back to Safety" : "Add Experience"}
            actionHref={!trip ? "/" : "/architect"}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-background">
      <ConciergeHeader trip={trip} totalCost={totalCost} />
      <div className="flex flex-1 pt-[88px] overflow-hidden">
        <Timeline 
          activities={activities} 
          activeActivityId={activeActivityId || undefined}
          onActivityHover={setActiveActivityId}
        />
        <InteractiveMap 
          activities={activities}
          activeActivityId={activeActivityId}
          tripTitle={trip.title}
        />
      </div>
    </main>
  );
}
