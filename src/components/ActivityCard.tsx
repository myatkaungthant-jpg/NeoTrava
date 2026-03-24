import { cn } from "@/lib/utils";
import { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
  isActive?: boolean;
}

export const ActivityCard = ({ activity, isActive = false }: ActivityCardProps) => {
  const displayTime = activity.start_time?.includes(",") 
    ? activity.start_time.split(",").pop()?.trim() 
    : activity.start_time;

  return (
    <div className="relative pl-12 mb-10 group cursor-pointer">
      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute left-0 top-6 w-6 h-6 rounded-full border-4 transition-all duration-500 z-10",
          isActive
            ? "border-primary-fixed-dim bg-primary scale-125 shadow-[0_0_15px_rgba(0,105,72,0.4)]"
            : "border-surface bg-primary-fixed-dim group-hover:scale-125"
        )}
      />

      <div className="flex flex-col gap-2">
        <span
          className={cn(
            "text-sm font-bold transition-colors",
            isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
          )}
        >
          {displayTime || "Flexible"}
        </span>
        <div
          className={cn(
            "bg-surface-container-lowest p-6 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,105,72,0.08)]",
            isActive && "border-2 border-primary-fixed-dim shadow-[0_20px_60px_rgba(0,105,72,0.12)]",
            !isActive && "opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0"
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-on-surface leading-tight">
              {activity.title}
            </h3>
            {activity.cost_thb > 0 ? (
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider italic shrink-0",
                isActive ? "bg-primary-fixed text-on-primary-fixed" : "bg-secondary-container text-on-secondary-container"
              )}>
                {activity.cost_thb} THB {activity.is_verified_tat && "• TAT Verified"}
              </span>
            ) : (
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider italic shrink-0">
                Free Entry
              </span>
            )}
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
            {activity.description}
          </p>
          {activity.image_url && (
            <div className="relative w-full h-32 overflow-hidden rounded-lg mt-2">
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
