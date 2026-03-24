"use client";

import { useState } from "react";
import { Sparkles, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { generateItinerary } from "@/services/ai";
import { createTrip, createActivity } from "@/services/data";
import { useNavigate } from "react-router-dom";

export const ArchitectView: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("Chiang Mai");
  const [duration, setDuration] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(150000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Generate activities via AI
      const generatedActivities = await generateItinerary(destination, duration, travelers, budget);
      
      if (!generatedActivities || generatedActivities.length === 0) {
        throw new Error("Failed to generate activities.");
      }

      // 2. Create the Trip in Supabase
      const newTrip = await createTrip({
        title: `Curated ${destination} Escape`,
      });

      if (!newTrip) {
        throw new Error("Failed to save the trip.");
      }

      // 3. Save all activities safely mapping only allowed properties
      const activitiesPromises = generatedActivities.map(activity => 
        createActivity({
          trip_id: newTrip.id,
          title: activity.title || "Curated Experience",
          description: activity.description || "A wonderful experience hand-picked for your journey.",
          location_name: activity.location_name || destination,
          start_time: activity.start_time || "TBD",
          cost_thb: Number(activity.cost_thb) || 0,
          is_verified_tat: !!activity.is_verified_tat,
        })
      );
      
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
    <div className="pb-24 px-6 md:px-12 max-w-7xl mx-auto mt-12 w-full">
      {/* Hero Section */}
      <section className="relative text-center mb-16 md:mb-24">
        <div className="inline-block px-4 py-1.5 mb-6 bg-emerald-50 text-emerald-900 rounded-full text-[11px] font-bold tracking-widest uppercase">
          AI-Powered Travel Design
        </div>
        <h1 className="font-headline font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter text-emerald-900 mb-8 leading-[1.1]">
          Experience Thailand, <br />
          <span className="text-emerald-600 italic">Curated</span> by AI.
        </h1>
        <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-light leading-relaxed">
          Skip the generic guides. Our Digital Curator builds bespoke, high-end itineraries inspired by Thailand&apos;s lush landscapes and coastal elegance.
        </p>
      </section>

      {/* Architect Input Shell */}
      <section className="relative z-10 w-full">
        <form 
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-premium border border-emerald-50"
          onSubmit={handleGenerate}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Destination */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40 px-1">
                Destination
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-12 pr-4 py-4 text-emerald-900 font-medium appearance-none outline-none"
                >
                  <option>Chiang Mai</option>
                  <option>Chiang Rai</option>
                  <option>Phuket & Islands</option>
                  <option>Bangkok Exclusive</option>
                  <option>All North</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40 px-1">
                Duration
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={20} />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-emerald-50/50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 pl-12 pr-4 py-4 text-emerald-900 font-medium outline-none"
                  placeholder="Number of days"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40 px-1">
                Travelers
              </label>
              <div className="flex items-center bg-emerald-50/50 rounded-xl px-2 py-1.5 h-full">
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

            {/* Budget */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold tracking-wide uppercase text-emerald-900/40 px-1">
                Budget (THB)
              </label>
              <div className="relative flex flex-col justify-center h-full gap-2 pt-2">
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-semibold text-emerald-900/40 px-1">
                  <span>10k</span>
                  <span className="text-emerald-600">{budget.toLocaleString()} THB</span>
                  <span>500k</span>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div className="mt-12 flex justify-center">
            <button 
              type="submit"
              disabled={isGenerating}
              className="group relative px-10 py-5 bg-emerald-900 text-white rounded-2xl font-bold text-lg shadow-premium hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-3"
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
          </div>
        </form>
      </section>

      {/* Inspiration Bento */}
      <section className="mt-32">
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
  );
};
