"use client";

import React from "react";
import { Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  title: string;
  location: string;
  category: string;
  imageUrl: string;
  isFavorite?: boolean;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  location,
  category,
  imageUrl,
  isFavorite = true
}) => {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 relative shadow-premium transition-transform duration-500 group-hover:scale-[1.02]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20">
          <Star 
            className={cn(
              "text-white transition-colors",
              isFavorite && "fill-white"
            )} 
            size={20} 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-lg text-emerald-900 leading-tight group-hover:text-emerald-700 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
          <MapPin size={14} className="text-emerald-600" />
          <span>{location}</span>
          <span className="text-emerald-200">•</span>
          <span className="text-emerald-600 uppercase text-[10px] font-bold tracking-widest">{category}</span>
        </div>
      </div>
    </div>
  );
};
