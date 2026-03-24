import { useEffect, useState } from "react";
import DashboardClient from "@/components/DashboardClient";
import { getTripById, getActivities } from "@/services/data";
import { useParams } from "react-router-dom";
import { Trip, Activity } from "@/types";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      const tripData = await getTripById(id!);
      setTrip(tripData);
      
      if (tripData) {
        const activitiesData = await getActivities(id!);
        setActivities(activitiesData);
      }
      setLoading(false);
    }
    
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-emerald-900 text-xl font-bold">
        Loading itinerary...
      </div>
    );
  }

  return <DashboardClient trip={trip} activities={activities} />;
}
