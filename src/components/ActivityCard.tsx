import { cn } from "@/lib/utils";
import { Activity } from "@/types";
import { 
  Sun, SunMedium, Moon, Utensils, Coffee, Landmark, 
  Building, Tent, Mountain, Palmtree, ShoppingBag, 
  Waves, Ship, Plane, Train, Bus, Car, Palette, 
  PawPrint, Library, Flower2, MapPin, Beer, Wine, Trees, Droplets
} from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  isActive?: boolean;
}

const getActivityMetadata = (activity: Activity) => {
  const timeStr = activity.start_time || "";
  const title = (activity.title || "").toLowerCase();
  const desc = (activity.description || "").toLowerCase();
  const combined = `${title} ${desc}`;

  // 1. Determine Strategy Label & Default Icon based on time
  let strategy = "FLEXIBLE STRATEGY";
  let fallbackIcon = <SunMedium size={20} />;

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    if (hours >= 4 && hours < 12) {
      strategy = "MORNING STRATEGY";
      fallbackIcon = <Sun size={20} />;
    } else if (hours >= 12 && hours < 18) {
      strategy = "AFTERNOON STRATEGY";
      fallbackIcon = <SunMedium size={20} />;
    } else {
      strategy = "EVENING STRATEGY";
      fallbackIcon = <Moon size={20} />;
    }
  }

  // 2. Determine Dynamic Icon based on keywords
  let icon = fallbackIcon;

  const mappings = [
    { keywords: ['temple', 'wat', 'shrine', 'mosque', 'church', 'landmark'], icon: <Landmark size={20} /> },
    { keywords: ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'eat', 'dining'], icon: <Utensils size={20} /> },
    { keywords: ['coffee', 'cafe', 'tea', 'bakery'], icon: <Coffee size={20} /> },
    { keywords: ['bar', 'pub', 'club', 'nightlife'], icon: <Beer size={20} /> },
    { keywords: ['wine', 'tasting'], icon: <Wine size={20} /> },
    { keywords: ['hotel', 'resort', 'stay', 'check-in', 'hostel', 'villa', 'accommodation'], icon: <Building size={20} /> },
    { keywords: ['camp', 'tent', 'glamping'], icon: <Tent size={20} /> },
    { keywords: ['mountain', 'hill', 'doi', 'peak', 'trek', 'hiking'], icon: <Mountain size={20} /> },
    { keywords: ['forest', 'woods', 'jungle', 'park', 'nature', 'tree'], icon: <Trees size={20} /> },
    { keywords: ['garden', 'flower', 'botanical'], icon: <Flower2 size={20} /> },
    { keywords: ['waterfall', 'river', 'lake', 'canal'], icon: <Droplets size={20} /> },
    { keywords: ['beach', 'coast', 'surf', 'sand'], icon: <Palmtree size={20} /> },
    { keywords: ['island', 'koh', 'sea', 'ocean', 'waves'], icon: <Waves size={20} /> },
    { keywords: ['boat', 'cruise', 'kayak', 'pier', 'ship', 'ferry'], icon: <Ship size={20} /> },
    { keywords: ['airport', 'flight', 'plane'], icon: <Plane size={20} /> },
    { keywords: ['train', 'metro', 'subway'], icon: <Train size={20} /> },
    { keywords: ['bus', 'shuttle'], icon: <Bus size={20} /> },
    { keywords: ['car', 'taxi', 'cab', 'rental', 'drive'], icon: <Car size={20} /> },
    { keywords: ['shopping', 'market', 'bazaar', 'mall', 'store', 'shop'], icon: <ShoppingBag size={20} /> },
    { keywords: ['museum', 'gallery', 'art', 'exhibition', 'exhibit'], icon: <Palette size={20} /> },
    { keywords: ['zoo', 'animal', 'safari', 'elephant', 'sanctuary'], icon: <PawPrint size={20} /> }, 
    { keywords: ['history', 'historic', 'ancient', 'ruins', 'heritage'], icon: <Library size={20} /> },
  ];

  for (const m of mappings) {
    if (m.keywords.some(k => combined.includes(k))) {
      icon = m.icon;
      break;
    }
  }

  return { strategy, icon };
};

export const ActivityCard = ({ activity, isActive = false }: ActivityCardProps) => {
  const { strategy, icon } = getActivityMetadata(activity);
  
  const displayTime = activity.start_time?.includes(",") 
    ? activity.start_time.split(",").pop()?.trim() 
    : activity.start_time;

  return (
    <div className="relative pl-0 mb-10 group cursor-pointer">
      <div className="flex flex-col gap-1 mb-4 ml-2">
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-[12px] font-black tracking-widest transition-colors",
            isActive ? "text-primary" : "text-primary/60"
          )}>
            {displayTime || "FLEXIBLE"}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
            {strategy}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Icon Circle */}
        <div className="flex flex-col items-center min-h-[140px]">
          {/* Top Connector */}
          <div className="w-[2px] h-6 bg-primary/10" />
          
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 shrink-0",
              isActive
                ? "bg-primary text-white scale-110 shadow-[0_10px_20px_rgba(0,105,72,0.3)]"
                : "bg-surface-container-highest text-primary/40 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
            )}
          >
            {icon}
          </div>

          {/* Bottom Connector */}
          <div className="w-[2px] flex-1 bg-primary/10 mt-2" />
        </div>

        {/* Card Content */}
        <div
          className={cn(
            "flex-1 bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 hover:bg-white border border-transparent",
            isActive && "border-primary/20 shadow-[0_20px_60px_rgba(0,105,72,0.08)]",
            !isActive && "opacity-80 grayscale-[0.2] hover:opacity-100 hover:grayscale-0"
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className={cn(
              "text-xl font-bold font-headline leading-tight transition-colors",
              isActive ? "text-primary" : "text-on-surface"
            )}>
              {activity.title}
            </h3>
            {activity.cost_thb > 0 ? (
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold tracking-tight shrink-0",
                isActive ? "bg-primary text-white" : "bg-primary/5 text-primary"
              )}>
                {activity.cost_thb.toLocaleString()} THB
              </span>
            ) : (
              <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-tight shrink-0">
                Free Entry
              </span>
            )}
          </div>
          
          <p className="text-on-surface-variant text-sm leading-relaxed mb-4 font-body">
            {activity.description}
          </p>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <MapPin size={12} className="text-primary/40" />
                {activity.location_name?.split(',')[0]}
             </div>
             {activity.is_verified_tat && (
               <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                 TAT Verified
               </div>
             )}
          </div>

          {activity.image_url && (
            <div className="relative w-full h-40 overflow-hidden rounded-xl mt-6 group/img">
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
