import React, { useEffect, useState } from "react";
import { Search, Filter, Plus, Minus, Navigation } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";

interface InteractiveMapProps {
  activities: Activity[];
  activeActivityId?: string | null;
  tripTitle?: string;
}

// Custom hook to geocode a location name
const useGeocode = (address: string) => {
  const geocodingLib = useMapsLibrary('geocoding');
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (!geocodingLib || !address) return;
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        setCoordinates({ lat: location.lat(), lng: location.lng() });
      }
    });
  }, [geocodingLib, address]);

  return coordinates;
};

// Component that handles geocoding and rendering the marker
const GeocodedMarker = ({ activity, isActive }: { activity: Activity, isActive: boolean }) => {
  // Use existing coords if present, otherwise try to geocode the location_name
  const geocodedCoords = useGeocode(activity.location_name + ", Thailand");
  const position = (activity.latitude && activity.longitude) 
    ? { lat: activity.latitude, lng: activity.longitude }
    : geocodedCoords;

  if (!position) return null;

  return (
    <AdvancedMarker
      position={position}
      className={cn(
        "flex flex-col items-center",
        isActive && "z-10"
      )}
    >
      <div
        className={cn(
          "p-1 rounded-lg shadow-premium mb-2 flex items-center gap-2 border transition-all duration-300",
          isActive
            ? "bg-primary text-on-primary border-primary-fixed-dim px-2"
            : "bg-white border-outline-variant/20"
        )}
      >
        {activity.image_url && (
          <img
            src={activity.image_url}
            alt=""
            className={cn(
              "rounded object-cover transition-all",
              isActive ? "w-10 h-10" : "w-8 h-8"
            )}
          />
        )}
        <div className="flex flex-col">
          <span
            className={cn(
              "text-[10px] font-bold",
              isActive ? "text-[11px] uppercase tracking-tight" : "pr-2"
            )}
          >
            {activity.title}
          </span>
          {isActive && (
            <span className="text-[9px] opacity-80">Currently Viewing</span>
          )}
        </div>
      </div>
      <div className="relative">
        {isActive && (
          <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
        )}
        <div
          className={cn(
            "rounded-full border-[3px] shadow-md relative z-10 transition-all duration-300 mx-auto",
            isActive
              ? "w-6 h-6 bg-primary border-primary-fixed-dim"
              : "w-4 h-4 bg-white border-emerald-800"
          )}
        />
      </div>
    </AdvancedMarker>
  );
};

const MapController = ({ activities, activeId, tripTitle }: { activities: Activity[], activeId?: string | null, tripTitle?: string }) => {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');

  React.useEffect(() => {
    if (!map || !geocodingLib) return;
    const activeActivity = activities.find(a => a.id === activeId);
    
    if (activeActivity) {
      if (activeActivity.latitude && activeActivity.longitude) {
        map.panTo({ lat: activeActivity.latitude, lng: activeActivity.longitude });
        map.setZoom(15);
      } else if (activeActivity.location_name) {
        // Geocode on the fly to center map
        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ address: activeActivity.location_name + ", Thailand" }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            map.panTo({ lat: location.lat(), lng: location.lng() });
            map.setZoom(15);
          }
        });
      }
    } else if (tripTitle) {
      // Default center based on the overall trip destination
      const geocoder = new geocodingLib.Geocoder();
      geocoder.geocode({ address: tripTitle + ", Thailand" }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          map.panTo({ lat: location.lat(), lng: location.lng() });
          map.setZoom(11); // broader zoom for trip overview
        }
      });
    }
  }, [map, activeId, activities, geocodingLib, tripTitle]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  activeActivityId,
  tripTitle
}) => {
  // Initial fallback center before Geocoder loads
  const defaultCenter = { lat: 13.7563, lng: 100.5018 }; // Bangkok default

  return (
    <section className="hidden md:block md:w-[60%] h-full relative">
      <div className="w-full h-full bg-surface-container-high relative overflow-hidden">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={11}
            defaultCenter={defaultCenter}
            disableDefaultUI={true}
            mapId="neotrava-curator-map"
          >
            <MapController activities={activities} activeId={activeActivityId} tripTitle={tripTitle} />
            
            {/* Custom Map Pins via AdvancedMarker and Geocoding */}
            {activities.map((activity) => (
              <GeocodedMarker 
                key={activity.id} 
                activity={activity} 
                isActive={activeActivityId === activity.id} 
              />
            ))}
          </Map>
        </APIProvider>

        {/* Map Overlay: Top Search */}
        <div className="absolute top-6 left-6 right-6 flex items-center gap-4 z-20 pointer-events-none">
          <div className="bg-white/70 backdrop-blur-xl flex-1 px-6 py-4 rounded-full shadow-premium flex items-center gap-3 border border-white/20 pointer-events-auto">
            <Search size={18} className="text-primary" />
            <input
              type="text"
              placeholder="Search local destinations..."
              className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600 w-full"
            />
          </div>
          <button className="bg-white/70 backdrop-blur-xl p-4 rounded-full shadow-premium text-primary transition-all active:scale-90 border border-white/20">
            <Filter size={20} />
          </button>
        </div>



        {/* Map Controls: Bottom Right */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
          <button className="bg-white/70 backdrop-blur-xl w-12 h-12 rounded-xl flex items-center justify-center text-primary shadow-premium hover:bg-white transition-all border border-white/20">
            <Plus size={20} />
          </button>
          <button className="bg-white/70 backdrop-blur-xl w-12 h-12 rounded-xl flex items-center justify-center text-primary shadow-premium hover:bg-white transition-all border border-white/20">
            <Minus size={20} />
          </button>
          <button className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-premium mt-4 scale-110 active:scale-100 transition-all">
            <Navigation size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
