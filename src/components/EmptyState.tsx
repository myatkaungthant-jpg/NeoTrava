import { Compass, Plus } from "lucide-react";
import { Link } from "react-router-dom";



export const EmptyState = ({
  title = "No trips found",
  subtitle = "You haven't designed any journeys yet. Let's build your first signature itinerary.",
  actionLabel = "Start Architecting",
  actionHref = "/architect",
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-900 mb-8 animate-pulse">
        <Compass size={48} />
      </div>
      <h2 className="text-4xl font-black text-emerald-900 tracking-tighter mb-4">
        {title}
      </h2>
      <p className="text-slate-500 max-w-md mx-auto text-lg font-light leading-relaxed mb-10">
        {subtitle}
      </p>
      <Link 
        to={actionHref}
        className="group flex items-center gap-3 bg-emerald-900 text-white px-10 py-5 rounded-full font-headline font-bold text-lg shadow-premium hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
        {actionLabel}
      </Link>
    </div>
  );
};
