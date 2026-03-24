import { TopNavBar } from "@/components/TopNavBar";
import { ArchitectView } from "@/components/ArchitectView";

export default function HomePage() {
  // If no trips, show the Architect directly as the Dashboard
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNavBar />
      <div className="flex-1 pt-[88px] flex flex-col">
        <ArchitectView />
      </div>
    </main>
  );
}
