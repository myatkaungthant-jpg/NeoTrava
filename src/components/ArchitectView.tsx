"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles, MapPin, Calendar, ArrowRight, Loader2, Search, ChevronDown, Trees, Utensils, Landmark, ShoppingBag, Moon, Mountain, ScrollText, Palette, Palmtree, Globe, Share2 } from "lucide-react";
import { generateItinerary } from "@/services/ai";
import { createTrip, createActivity } from "@/services/data";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { THAILAND_DESTINATIONS } from "@/lib/destinations";
import { SUB_DESTINATIONS } from "@/lib/subDestinations";

const CURRENCIES = {
  THB: { symbol: '฿', rate: 1, min: 1000, max: 200000, step: 1 },
  USD: { symbol: '$', rate: 0.03, min: 30, max: 6000, step: 1 },
  EUR: { symbol: '€', rate: 0.027, min: 30, max: 5500, step: 1 },
  GBP: { symbol: '£', rate: 0.023, min: 25, max: 4500, step: 1 },
};
type CurrencyCode = keyof typeof CURRENCIES;

const EXPERIENCES = [
  { id: "nature", label: "Nature", icon: <Trees size={24} className="text-emerald-600" /> },
  { id: "food", label: "Food", icon: <Utensils size={24} className="text-orange-500" /> },
  { id: "culture", label: "Culture", icon: <Landmark size={24} className="text-stone-500" /> },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag size={24} className="text-pink-500" /> },
  { id: "nightlife", label: "Nightlife", icon: <Moon size={24} className="text-indigo-500" /> },
  { id: "adventure", label: "Adventure", icon: <Mountain size={24} className="text-red-500" /> },
  { id: "history", label: "History", icon: <ScrollText size={24} className="text-amber-700" /> },
  { id: "art", label: "Art", icon: <Palette size={24} className="text-purple-500" /> },
  { id: "beaches", label: "Beaches", icon: <Palmtree size={24} className="text-cyan-500" /> },
];

export const ArchitectView: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [destination, setDestination] = useState("Chiang Mai");
  const [selectedSubDestinations, setSelectedSubDestinations] = useState<string[]>([]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  
  const [travelers, setTravelers] = useState(2);
  const [currency, setCurrency] = useState<CurrencyCode>("THB");
  const [budget, setBudget] = useState(0);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(event.target as Node)) {
        setIsSubDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDestinations = useMemo(() => {
    return THAILAND_DESTINATIONS.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const filteredSubDestinations = useMemo(() => {
    if (!destination || !SUB_DESTINATIONS[destination]) return [];
    return SUB_DESTINATIONS[destination].filter(s => s.toLowerCase().includes(subSearchQuery.toLowerCase()));
  }, [destination, subSearchQuery]);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    const toThb = (val: number) => val / CURRENCIES[currency].rate;
    const fromThb = (val: number) => {
      let num = Math.round(val * CURRENCIES[newCurrency].rate);
      num = Math.max(CURRENCIES[newCurrency].min, Math.min(CURRENCIES[newCurrency].max, num));
      return Math.round(num / CURRENCIES[newCurrency].step) * CURRENCIES[newCurrency].step;
    };
    
    setBudget(fromThb(toThb(budget)));
    setCurrency(newCurrency);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Generate activities via AI
      const maxThb = Math.round(budget / CURRENCIES[currency].rate);
      const result = await generateItinerary(destination, selectedSubDestinations, startDate, endDate, travelers, maxThb, selectedExperiences);
      
      if (!result.activities || result.activities.length === 0) {
        throw new Error("Failed to generate activities.");
      }

      // 2. Create the Trip in Supabase
      const { trip: newTrip, error: tripError } = await createTrip({
        title: result.title,
        subtitle: result.subtitle,
        start_date: startDate,
        end_date: endDate,
        destination: destination,
      });

      if (tripError || !newTrip) {
        throw new Error(tripError || "Failed to save the trip.");
      }

      // 3. Save all activities (map will geocode location_name at render time)
      const activitiesPromises = result.activities.map((activity) => {
        const locName = activity.location_name || activity.title || destination;
        
        return createActivity({
          trip_id: newTrip.id,
          title: activity.title || "Curated Experience",
          description: activity.description || "A wonderful experience hand-picked for your journey.",
          location_name: locName,
          start_time: activity.start_time || "TBD",
          cost_thb: Number(activity.cost_thb) || 0,
          is_verified_tat: !!activity.is_verified_tat,
        });
      });
      
      await Promise.all(activitiesPromises);

      // 4. Navigate to the new Concierge view
      navigate(`/trips/${newTrip.id}`);
      
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Cinematic Hero Video Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex flex-col items-center justify-center text-center overflow-hidden mb-16 md:mb-24 rounded-b-[4rem] shadow-2xl">
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="/assets/videos/MainVideo.webm" type="video/webm" />
        </video>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-emerald-950/80" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* Content Overlay */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-8 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[11px] font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Digital Curator • Thailand 2026
          </div>
          <h1 className="font-headline font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter text-white mb-8 leading-[0.9] drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Experience Thailand, <br />
            <span className="text-emerald-400 italic">Curated</span> by AI.
          </h1>
          <p className="max-w-2xl mx-auto text-white/80 text-lg md:text-2xl font-light leading-relaxed drop-shadow-lg animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            Bespoke, high-end itineraries inspired by the Kingdom&apos;s lush landscapes and coastal elegance.
          </p>
        </div>
      </section>

      <div className="px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Architect Input Shell */}
        <section className="relative z-10 w-full">
          <form 
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-premium border border-emerald-50"
            onSubmit={handleGenerate}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10 items-start">
              {/* Destination */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-3 relative" ref={dropdownRef}>
                <div className="h-8 flex items-center px-1">
                  <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40">
                    Province / Region
                  </label>
                </div>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                  <div className="w-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-12 pr-10 py-4 text-emerald-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis h-14 flex items-center inline-block min-w-0">
                    {destination || "Select Province"}
                  </div>
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-[100%] mt-2 left-0 w-full md:min-w-[320px] bg-white rounded-2xl shadow-premium border border-emerald-50 z-50 overflow-hidden flex flex-col max-h-[350px]">
                    <div className="p-3 border-b border-emerald-50 relative bg-slate-50/50">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search regions, cities, islands..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-shadow"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                      {filteredDestinations.length > 0 ? filteredDestinations.map(dest => (
                        <div 
                          key={dest}
                          className={`px-4 py-3 cursor-pointer rounded-xl text-sm font-medium transition-colors ${destination === dest ? 'bg-emerald-500 text-white shadow-md' : 'hover:bg-emerald-50 text-emerald-950'}`}
                          onClick={() => {
                            setDestination(dest);
                            setSelectedSubDestinations([]); // Reset districts when province changes
                            setSubSearchQuery(""); // Reset sub-search when province changes
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          {dest}
                        </div>
                      )) : (
                        <div className="px-4 py-8 text-center text-emerald-900/40 text-sm font-medium flex flex-col items-center gap-2">
                          <MapPin size={24} className="opacity-20" />
                          No destinations found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-destination (Specific District/Area) */}
              <div className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col gap-3 relative" ref={subDropdownRef}>
                <div className="h-8 flex items-center px-1">
                  <label className={`text-[11px] font-bold tracking-wide uppercase transition-colors ${!destination ? 'text-emerald-900/10' : 'text-emerald-900/40'}`}>
                    Specific Areas (Optional)
                  </label>
                </div>
                <div 
                  className={`relative group cursor-pointer transition-opacity ${!destination ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                  onClick={() => destination && setIsSubDropdownOpen(!isSubDropdownOpen)}
                >
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${!destination ? 'text-slate-300' : 'text-emerald-600'}`} size={20} />
                  <div className={`w-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-12 pr-10 py-4 text-emerald-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis h-14 flex items-center`}>
                    {selectedSubDestinations.length > 0 
                      ? selectedSubDestinations.join(", ") 
                      : destination ? "All Districts" : "Select Province First"}
                  </div>
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isSubDropdownOpen ? 'rotate-180' : ''} ${!destination ? 'text-slate-300' : 'text-emerald-600/60'}`} size={16} />
                </div>

                {/* Sub-Dropdown Menu (Multi-select) */}
                {isSubDropdownOpen && destination && (
                  <div className="absolute top-[100%] mt-2 left-0 w-full md:min-w-[320px] bg-white rounded-2xl shadow-premium border border-emerald-50 z-50 overflow-hidden flex flex-col max-h-[350px]">
                    <div className="p-3 border-b border-emerald-50 relative bg-slate-50/50">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search districts, areas..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-shadow"
                        value={subSearchQuery}
                        onChange={(e) => setSubSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="p-2 border-b border-emerald-50 bg-white/50 flex justify-between items-center px-4">
                      <span className="text-[10px] font-black tracking-widest text-emerald-900/40 uppercase">Select Multiple Districts / Areas</span>
                      <button 
                        type="button"
                        onClick={() => setSelectedSubDestinations([])}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-900"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                      {filteredSubDestinations.length > 0 ? filteredSubDestinations.map(sub => {
                        const isSelected = selectedSubDestinations.includes(sub);
                        return (
                          <div 
                            key={sub}
                            className={`px-4 py-3 cursor-pointer rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-emerald-50 text-emerald-950'}`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSubDestinations(selectedSubDestinations.filter(s => s !== sub));
                              } else {
                                setSelectedSubDestinations([...selectedSubDestinations, sub]);
                              }
                            }}
                          >
                            {sub}
                            {isSelected && <Sparkles size={14} className="text-emerald-500" />}
                          </div>
                        );
                      }) : (
                        <div className="px-4 py-8 text-center text-emerald-900/40 text-sm font-medium flex flex-col items-center gap-2">
                          <Search size={24} className="opacity-20" />
                          No areas found in {destination}.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Travelers */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-3">
                <div className="h-8 flex items-center px-1">
                  <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40">
                    Travelers
                  </label>
                </div>
                <div className="flex items-center bg-emerald-50/50 rounded-xl px-2 py-1.5 h-14">
                  <button 
                    type="button"
                    onClick={() => travelers > 1 && setTravelers(travelers - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-lg text-emerald-900">{travelers}</div>
                  <button 
                    type="button"
                    onClick={() => setTravelers(travelers + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col gap-3">
                <div className="h-8 flex items-center px-1">
                  <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40">
                    Travel Dates
                  </label>
                </div>
                <div className="flex gap-2 h-14">
                  <div className="relative w-1/2 group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-600" size={14} />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-8 pr-1 py-4 text-emerald-900 text-[12px] font-bold outline-none uppercase"
                    />
                  </div>
                  <div className="relative w-1/2 group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-600" size={14} />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full h-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-8 pr-1 py-4 text-emerald-900 text-[12px] font-bold outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-3">
                <div className="flex justify-between items-center px-1 h-8">
                  <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40">
                    Trip Budget ({currency})
                  </label>
                  <div className="flex bg-emerald-50/70 p-1 rounded-xl border border-emerald-100/50">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCurrencyChange(c)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all ${currency === c ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-emerald-600/60 hover:text-emerald-900 hover:bg-emerald-100/50'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative w-full h-14 group">
                  <div className="w-full h-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40 text-[10px] font-black tracking-widest pointer-events-none uppercase">BUDGET</span>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900/40 font-bold text-lg pointer-events-none">{CURRENCIES[currency].symbol}</span>
                    <input
                      type="number"
                      min={0}
                      max={CURRENCIES[currency].max}
                      step={CURRENCIES[currency].step}
                      value={budget === 0 ? "" : budget}
                      placeholder="0"
                      onChange={(e) => {
                        setBudget(parseInt(e.target.value) || 0);
                      }}
                      onBlur={() => {
                        if (budget > CURRENCIES[currency].max) setBudget(CURRENCIES[currency].max);
                      }}
                      className="w-full h-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-20 pr-12 py-4 text-emerald-900 text-lg font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Experiences Grid */}
            <div className="mt-12 pt-10 border-t border-emerald-50/60 w-full mb-4">
              <div className="mb-6 flex justify-between items-end px-2">
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-500" />
                    Curated Experiences
                  </h3>
                  <p className="text-emerald-600/60 text-sm mt-1 font-medium">Select the themes you want to focus on for this itinerary</p>
                </div>
                <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">
                  {selectedExperiences.length} Selected
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {EXPERIENCES.map(exp => {
                  const isSelected = selectedExperiences.includes(exp.label);
                  return (
                    <div 
                      key={exp.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedExperiences(selectedExperiences.filter(e => e !== exp.label));
                        } else {
                          setSelectedExperiences([...selectedExperiences, exp.label]);
                        }
                      }}
                      className={`relative cursor-pointer rounded-2xl flex flex-col items-center justify-center p-5 transition-all duration-300 border-2 select-none group overflow-hidden ${isSelected ? 'border-emerald-500 bg-emerald-50/80 shadow-md transform scale-[1.02]' : 'border-emerald-50/50 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:scale-[1.01]'}`}
                    >
                      <div className={`transition-transform duration-300 mb-3 ${isSelected ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                         {exp.icon}
                      </div>
                      <span className={`font-bold tracking-wide text-xs uppercase ${isSelected ? 'text-emerald-950' : 'text-emerald-900/50 group-hover:text-emerald-900/80'}`}>{exp.label}</span>
                      <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isSelected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] scale-100' : 'bg-transparent scale-0'}`} />
                    </div>
                  )
                })}
              </div>
            </div>
            
            {!authLoading && !user && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold text-center border border-amber-100 flex items-center justify-center gap-2">
                <MapPin size={16} />
                Please sign in to save and view your interactive itineraries.
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div className="mt-12 flex flex-col items-center gap-4">
              <button 
                type="submit"
                disabled={isGenerating || authLoading || !user}
                className="group relative px-10 py-5 bg-emerald-900 text-white rounded-2xl font-bold text-lg shadow-premium hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Curating your journey...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover:animate-spin-slow" />
                    Generate Interactive Itinerary
                  </>
                )}
              </button>
              {!authLoading && !user && (
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-emerald-700 font-bold text-sm hover:underline"
                >
                  Sign In Now
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Inspiration Bento */}
        <section className="mt-32 mb-32">
          {/* ... (existing content remains exactly same) */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-600">Inspiration</span>
              <h2 className="text-4xl font-black tracking-tight mt-2 text-emerald-900">The Emerald Collection</h2>
            </div>
            <button className="text-emerald-900 font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
              View All Destinations <ArrowRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group cursor-pointer">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] mb-6 relative shadow-premium">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLKopAUnuumW7qezBA4_KwfXRI9l1f6bJFh6XJTTkW8SD7plMd7ekMxglMu7SiPs9BkIhVCTqTu7LePtGOSNbfwTx95ac5pNkF2W8x_JDZkX_VEfziKlZtdy0gpiMTg_eSKtRMeYFswLh7K81jWgoBqw2dsMp3jr8bW1kmQ0rKAp0vl7sSpoRnPMR3U5_n6_RhDCEBT72wGB_jnauOJH-rdnsEpfHU7RgRMkanVbSnNgUAJgEy7MdYp1XhcHYmRGzOEFbiIsyj9zDd"
                  alt="Chiang Mai"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-emerald-950/80 to-transparent pt-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">North</span>
                  <h5 className="text-2xl font-black text-white">Chiang Mai Artisans</h5>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="group cursor-pointer md:translate-y-12">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] mb-6 relative shadow-premium">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvWQkeNB1KMtkv5n-0JVvLTgZ52SdHOKyjHFrSoCsjCs5u9OHNx1JXGs18hV7Cgpv6_s4Q1uA92SzrNYaGpbjN59IDUfKY8A7Gu49q7pDwF8JEMAfrcncbDGwC2uoZn9lVO4DDy6MTDRpBxHjasecuAyj0sUJtkqaAS_T3Zay4syIshd1ui8JZxWLjLBzdBa6BZrrCwy-8z39xYbXZPAE4Fc4DIkazivRL6Z1g9E-_adhc8dearDbPXfBXcNYBtPj4-ZDJYemvaE8K"
                  alt="Krabi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-emerald-950/80 to-transparent pt-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Coast</span>
                  <h5 className="text-2xl font-black text-white">Krabi Secret Coves</h5>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group cursor-pointer">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] mb-6 relative shadow-premium">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4qG_vsjx9sdd_f24DvAO5_W9KWDT5nWYjJNm2V_xBiKr_7szBpxC5DQqyBDvN_uUi1TL7rn2pZ5omaFBN6dn89ybREp89EMJySdK50VYIMeB7hh7Q-EnEDyM1-moNgTaeTEoK1y0ZZ58CZoYS47pNzxEH2eNbjoVBtK2OmUF_8fPhActBYSrcO15XY2TNVI73ObXA6Zwgo6B1CG9cpUb_y5eWkycPMRr-KJ0xPB7zuwIZkkuiluAWhr1Khfe-ZkD4EIBtFb-BEbPv"
                  alt="Bangkok"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-emerald-950/80 to-transparent pt-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">City</span>
                  <h5 className="text-2xl font-black text-white">Skyline Gastronomy</h5>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Minimalist Light Footer Section */}
      <footer className="w-full bg-white border-t border-emerald-50 rounded-t-3xl px-6 md:px-12 py-12 overflow-hidden relative font-body">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Branding & Copyright (Left) */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <img src="/NeoTrava.png" alt="NeoTrava Logo" className="h-8 w-auto" />
              <span className="text-xl font-black tracking-tighter text-emerald-900 uppercase">NeoTrava</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.05em] uppercase">
              © 2026 NeoTrava. The Digital Curator.
            </p>
          </div>

          {/* Navigation Links (Center) */}
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
            <span className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Privacy</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Terms</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Curator Guidelines</span>
          </div>

          {/* Social Icons (Right) */}
          <div className="flex items-center gap-6 text-slate-400">
            <div className="cursor-pointer hover:text-emerald-600 transition-colors">
              <Share2 size={18} />
            </div>
            <div className="cursor-pointer hover:text-emerald-600 transition-colors">
              <Globe size={18} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArchitectView;
