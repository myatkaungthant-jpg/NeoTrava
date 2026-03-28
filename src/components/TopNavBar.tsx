import { useEffect, useState, useRef } from "react";
import { Bell, User, ChevronDown, MapPin, Calendar, Compass, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getTrips } from "@/services/data";
import { Trip } from "@/types";

export const TopNavBar = () => {
  const { pathname } = useLocation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTrips() {
      const data = await getTrips();
      setTrips(data);
    }
    fetchTrips();
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const latestTripId = trips.length > 0 ? trips[0].id : null;
  const conciergeHref = latestTripId ? `/trips/${latestTripId}` : "#";

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-xl shadow-premium border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black text-emerald-900 italic tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
          <img src="/NeoTrava.png" alt="NeoTrava Logo" className="h-8 w-auto" />
          NeoTrava
        </Link>
        <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
        
        <div className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className={cn(
              "font-headline font-semibold text-lg transition-all px-4 py-2 rounded-lg",
              pathname === "/" ? "text-emerald-900 bg-emerald-50/50" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
            )}
          >
            Architect
          </Link>

          {/* Concierge with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <Link 
                to={conciergeHref}
                className={cn(
                  "font-headline font-semibold text-lg transition-all pl-4 pr-1 py-2 rounded-l-lg",
                  pathname.startsWith("/trips/") ? "text-emerald-900 bg-emerald-50/50" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
                )}
              >
                Concierge
              </Link>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "pr-4 pl-1 py-2 rounded-r-lg transition-all flex items-center h-[44px]",
                  pathname.startsWith("/trips/") ? "text-emerald-900 bg-emerald-50/50" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
                )}
              >
                <ChevronDown size={18} className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180")} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-emerald-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-emerald-50 bg-emerald-50/30">
                  <h3 className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-widest flex items-center gap-2">
                    <Compass size={12} />
                    Signature Journeys
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {trips.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-slate-400 text-sm mb-4">No active itineraries</p>
                      <Link 
                        to="/" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Start Architecture →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-2">
                      {trips.map((trip) => (
                        <Link
                          key={trip.id}
                          to={`/trips/${trip.id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className={cn(
                            "flex flex-col gap-1 px-6 py-4 hover:bg-emerald-50 transition-colors group",
                            pathname === `/trips/${trip.id}` && "bg-emerald-50/50"
                          )}
                        >
                          <span className="text-sm font-bold text-emerald-900 group-hover:text-emerald-700">
                            {trip.title}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium capitalize">
                              <MapPin size={10} /> {trip.destination || "Thailand"}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar size={10} /> {
                                trip.start_date && trip.end_date
                                  ? `${Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)} Days`
                                  : "—"
                              }
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {trips.length > 0 && (
                  <div className="p-4 bg-slate-50/50 border-t border-emerald-50 mt-auto">
                    <Link 
                      to="/trips"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full py-2 text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={12} />
                      Manage All Itineraries
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link 
            to="/importer" 
            className={cn(
              "font-headline font-semibold text-lg transition-all px-4 py-2 rounded-lg",
              pathname === "/importer" ? "text-emerald-900 bg-emerald-50/50" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
            )}
          >
            Importer
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-emerald-700 transition-all hover:scale-110 active:scale-90">
          <Bell size={20} />
        </button>
        <Link 
          to="/profile" 
          className={cn(
            "p-2 rounded-full transition-all hover:scale-110 active:scale-90",
            pathname === "/profile" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
          )}
        >
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
};
