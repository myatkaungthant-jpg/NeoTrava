import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";
import { getTrips, deleteTrip } from "@/services/data";
import { Trip } from "@/types";
import { Calendar, MapPin, Search, Trash2, ArrowRight } from "lucide-react";

export default function ItinerariesPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTrips() {
      const data = await getTrips();
      setTrips(data);
      setLoading(false);
    }
    loadTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault(); // Prevent navigating to the card if wrapped in a Link
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this itinerary? This action cannot be undone.");
    if (!confirmDelete) return;

    const success = await deleteTrip(tripId);
    if (success) {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } else {
      alert("Failed to delete trip. Please try again.");
    }
  };

  const filteredTrips = trips.filter((t) => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <TopNavBar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-32 md:py-40 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-in slide-in-from-bottom-8 duration-700">
          <div>
            <span className="inline-block px-3 py-1 bg-surface-container/50 text-emerald-800 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full mb-6 border border-outline-variant/30">
              Trip Archive
            </span>
            <h1 className="font-display font-medium text-4xl md:text-5xl lg:text-6xl text-on-surface tracking-tight leading-[1.1]">
              Manage <span className="text-primary italic font-normal">Itineraries</span>.
            </h1>
            <p className="font-sans text-on-surface-variant text-lg md:text-xl mt-4 max-w-2xl leading-relaxed">
              Review your bespoke travel plans, continue curating your upcoming journeys, or clear out past escapes.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 h-14 flex items-center shrink-0">
            <div className="absolute left-6 text-primary pointer-events-none">
              <Search size={22} className="opacity-70" />
            </div>
            <input
              type="text"
              placeholder="Search by destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-14 pr-6 bg-surface-container rounded-full text-lg text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-premium border border-white/40 transition-shadow"
            />
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-surface-container rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 bg-surface-container/30 rounded-3xl border border-white/20">
            <h3 className="text-2xl font-display text-on-surface mb-2">No itineraries found</h3>
            <p className="text-on-surface-variant mb-8">You haven't designed any trips yet.</p>
            <button 
              onClick={() => navigate("/architect")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold shadow-premium transition-transform active:scale-95"
            >
              Curate a New Journey
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip, index) => (
              <div 
                key={trip.id}
                className="group relative bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,105,72,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary border border-primary/10">
                        <MapPin size={22} strokeWidth={2.5} />
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      className="w-10 h-10 rounded-full bg-error-container/50 hover:bg-error text-error hover:text-white flex items-center justify-center transition-colors border border-error/10 hover:shadow-lg"
                      title="Delete Trip"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-on-surface mb-3 line-clamp-2 leading-tight">
                    {trip.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-6">
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant uppercase tracking-wider font-bold">
                      <Calendar size={16} className="text-primary/70" />
                      Created {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : "Just now"}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="mt-8 w-full group/btn flex items-center justify-between px-6 py-4 bg-primary text-white rounded-full font-bold shadow-premium hover:shadow-[0_15px_30px_rgba(0,105,72,0.2)] transition-all overflow-hidden relative active:scale-95"
                >
                  <span className="relative z-10">Open Concierge</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10 group-hover/btn:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </div>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
