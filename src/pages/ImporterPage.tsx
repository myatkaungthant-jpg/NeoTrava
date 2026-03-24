import { TopNavBar } from "@/components/TopNavBar";
import { MagicImporter } from "@/components/MagicImporter";

export default function ImporterPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col pt-[88px]">
      <TopNavBar />
      <div className="flex-1">
        <MagicImporter />
      </div>
    </main>
  );
}
