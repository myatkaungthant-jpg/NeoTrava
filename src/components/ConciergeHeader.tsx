import React from "react";
import { Bell, User, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Trip } from "@/types";

interface ConciergeHeaderProps {
  trip: Trip | null;
  totalCost?: number;
}

export const ConciergeHeader: React.FC<ConciergeHeaderProps> = ({ trip, totalCost = 0 }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-xl shadow-[0_48px_100px_0_rgba(0,105,72,0.06)] border-b border-outline-variant/10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-emerald-900 hover:bg-emerald-50 rounded-full transition-colors hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>
        <Link to="/" className="text-2xl font-black text-emerald-900 italic tracking-tighter hover:opacity-80 transition-opacity">
          Digital Curator
        </Link>
        <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
        <div className="hidden md:flex flex-col">
          <h1 className="font-headline font-semibold tracking-tight text-lg text-emerald-900">
            {trip?.title || "Signature Journey"}
          </h1>
          <p className="text-[11px] font-medium tracking-wide uppercase text-slate-500">
            {trip?.destination || "Thailand"} • Total Est: {totalCost.toLocaleString()} THB
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-emerald-700 transition-all hover:scale-110 active:scale-90">
          <Bell size={20} />
        </button>
        <Link 
          to="/profile" 
          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all hover:scale-110 active:scale-90"
        >
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
};
