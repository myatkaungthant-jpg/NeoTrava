import React, { useEffect, useState } from "react";
import { Edit, Diamond, Map, MessageSquare, ExternalLink, Loader2, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfile } from "@/services/data";
import { uploadAvatar } from "@/services/storage";
import { Profile } from "@/types";
import { useNavigate } from "react-router-dom";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ExperienceCard } from "@/components/ExperienceCard";

const MOCK_EXPERIENCES = [
  {
    title: "Phulay Bay Reserve",
    location: "Krabi, Thailand",
    category: "Secluded Luxury",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnmWJpLyzkcuNpJoviFZUtZ-NRixfdPeKZBjNdmbwqfgFqE__ckK5ToElzR9pzx8mcLsf1rrGKBTfZZuCwVq9O8RjSyrUveFBxFNT65YOm0priaDJagbgadsknPOdf5e_IkvNlyGjHri4xdTajwg2fvrAtztasLYc2wM9CO9E-5sYzWpphgXelJwImk9IQLKNAHeavsF72yXFAMQ7_RfcDCBcTgfofqKwICfXqmBdBsHhX_HRX5nwHgjQHRkSoIg6Kc0Fyisz8M7cn"
  },
  {
    title: "Old City Spiritual Walk",
    location: "Chiang Mai, Thailand",
    category: "Cultural Enthusiast",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp3K-YyVfUwufibPLwhLtyoAAxppo1G3hJM8bli892DSySPQ4V4urACdj-rmIrI9fm0j9fXFxDzuRgM6RwUWQG_QKgRacfudfQh7HbSiJ072fTE85LFcjyN3BNfAD21z62hCeZZ_x3P55zl95E-tidDhhcSzd9xS37xlT4Mw61CAGov0HmkW_KI0NVbCEwBID7o-JO9MVw8DrTcfqx0myRqXS9tW_EugsbIUoJ3yvnGdEFZGjHXGdXBPQC75c-EBERR2VWfyV68-ry"
  }
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile({
          id: "mock-id",
          full_name: "Julian Sterling",
          bio: "Exploring the world one secluded sanctuary at a time. Based in London, dreaming of the Andaman Sea.",
          travel_dna: {
            secluded_luxury: "Prioritizes privacy and high-end amenities in remote locations.",
            cultural_enthusiast: "Deep dives into local traditions, art galleries, and historic landmarks.",
            adventure_pulse: 65,
            gastronomy_level: 88
          },
          saved_experiences: []
        });
        setLoading(false);
        return;
      }

      const data = await getProfile(user.id);
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          id: user.id,
          full_name: user.email?.split("@")[0] || "New Traveler",
          bio: "Welcome to NeoTrava! Share your travel story here.",
          travel_dna: {
            secluded_luxury: "Standard preference.",
            cultural_enthusiast: "Standard preference.",
            adventure_pulse: 50,
            gastronomy_level: 50,
          },
          saved_experiences: [],
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [navigate]);

  const handleSave = async (updatedProfile: Profile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(updatedProfile);
      return;
    }

    await updateProfile(user.id, updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "mock-id";

    const publicUrl = await uploadAvatar(file, userId);
    if (publicUrl) {
      const updatedProfile = { ...profile, avatar_url: publicUrl };
      if (user) await updateProfile(user.id, updatedProfile);
      setProfile(updatedProfile);
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col pt-[88px]">
      <div className="pb-40 px-6 max-w-screen-2xl mx-auto mt-12 w-full">
        {/* Profile Header */}
        <section className="mb-20 flex flex-col md:flex-row items-end gap-12">
          <div className="relative group">
            <div 
              className={cn(
                "w-56 h-56 rounded-3xl overflow-hidden shadow-premium transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer relative",
                uploading && "opacity-50"
              )}
              onClick={handleAvatarClick}
            >
              <img
                src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop"}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <div 
              className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-emerald-900 p-4 rounded-full text-white shadow-premium cursor-pointer hover:scale-110 transition-transform z-20"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={24} />
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-2 block">Premium Curator Member</span>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-6xl font-black text-emerald-900 tracking-tighter">{profile.full_name}</h1>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-emerald-900/40 hover:text-emerald-900 transition-colors"
              >
                <Edit size={20} />
              </button>
            </div>
            <p className="text-neutral-600 max-w-xl text-lg font-light leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </section>

        {isEditing && (
          <ProfileEditor 
            profile={profile} 
            onSave={handleSave} 
            onClose={() => setIsEditing(false)} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-12 xl:col-span-7 space-y-12">
            {/* Travel DNA */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-emerald-900">Travel DNA</h2>
                <span className="text-sm font-semibold text-emerald-600 px-4 py-1 bg-emerald-50 rounded-full">AI Analyzed</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 bg-white p-8 rounded-xl shadow-premium flex flex-col justify-between h-64 border border-emerald-50 transition-all hover:shadow-premium">
                  <div>
                    <Diamond className="text-emerald-600 mb-4" size={32} />
                    <h3 className="text-xl font-bold mb-2 text-emerald-900">Secluded Luxury</h3>
                  </div>
                  <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                    {profile.travel_dna?.secluded_luxury || "Personalized luxury insights generating..."}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1 bg-emerald-900 text-white p-8 rounded-xl flex flex-col justify-between h-64 overflow-hidden relative shadow-premium">
                  <div className="z-10">
                    <Map className="text-emerald-400 mb-4" size={32} />
                    <h3 className="text-xl font-bold mb-2">Cultural Enthusiast</h3>
                  </div>
                  <p className="text-sm text-emerald-100/80 z-10 leading-relaxed font-light">
                    {profile.travel_dna?.cultural_enthusiast || "Deep diving into local heritage..."}
                  </p>
                  <div className="absolute -bottom-10 -right-10 opacity-20 transform rotate-12">
                    <Map size={192} />
                  </div>
                </div>
                <div className="col-span-2 bg-emerald-50/20 p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 border border-emerald-100/50">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold mb-1 text-emerald-900">Adventure Pulse</h3>
                    <div className="w-full bg-emerald-100/50 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="bg-emerald-900 h-full rounded-full transition-all duration-1000" style={{ width: `${profile.travel_dna?.adventure_pulse || 50}%` }}></div>
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-emerald-200/50"></div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold mb-1 text-emerald-900">Gastronomy Level</h3>
                    <div className="w-full bg-emerald-100/50 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="bg-emerald-900 h-full rounded-full transition-all duration-1000" style={{ width: `${profile.travel_dna?.gastronomy_level || 50}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Saved Experiences */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-emerald-900">Saved Experiences</h2>
                <button className="text-emerald-900 font-bold hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(profile.saved_experiences?.length ? profile.saved_experiences : MOCK_EXPERIENCES).map((exp, index) => (
                  <ExperienceCard 
                    key={index}
                    title={exp.title}
                    location={exp.location}
                    category={exp.category}
                    imageUrl={exp.imageUrl}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Account Settings Sidebar */}
          <aside className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="bg-white p-10 rounded-xl border border-emerald-50 shadow-premium">
              <h2 className="text-2xl font-bold mb-8 text-emerald-900">Account Settings</h2>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40">Member Type</label>
                  <div className="flex items-center justify-between border-b border-emerald-50 pb-2">
                    <span className="font-bold text-emerald-900">Premium Curator</span>
                    <span className="text-xs text-emerald-600 font-medium">Joined Mar 2024</span>
                  </div>
                </div>
                <div className="pt-8 flex flex-col gap-4 items-center">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full max-w-[280px] bg-emerald-900 text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-premium hover:opacity-90 transition-opacity active:scale-95 transition-all text-center"
                  >
                    Edit Profile Details
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full max-w-[280px] bg-slate-100 text-slate-600 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 p-8 rounded-xl flex flex-col gap-4 shadow-premium text-white relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="text-emerald-400"><MessageSquare size={24} /></div>
                <h3 className="font-bold text-xl">Need assistance?</h3>
              </div>
              <p className="text-sm text-emerald-100/80 relative z-10 leading-relaxed font-light">Your personal curator is available 24/7 to adjust your preferences or plan your next escape.</p>
              <button className="bg-white text-emerald-900 px-8 py-3 rounded-full text-xs font-bold shadow-premium flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all self-start relative z-10 active:scale-95">
                Start Chat
                <ExternalLink size={12} />
              </button>
              <div className="absolute -bottom-20 -right-20 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Zap size={200} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
