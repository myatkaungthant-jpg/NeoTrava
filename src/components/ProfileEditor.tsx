"use client";

import React, { useState } from "react";
import { X, Save, Diamond, Map, Zap, Utensils } from "lucide-react";
import { Profile } from "@/types";

interface ProfileEditorProps {
  profile: Profile;
  onSave: (updatedProfile: Profile) => Promise<void>;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDNAChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      travel_dna: {
        ...prev.travel_dna,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
          <div>
            <h2 className="text-3xl font-black text-emerald-900 tracking-tighter">Edit Profile</h2>
            <p className="text-emerald-700/60 text-sm font-medium">Refine your Digital Curator identity.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-900"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-12">
          {/* Basic Info */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-900/40">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-900">Display Name</label>
                <input 
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-emerald-50/50 border-none rounded-xl p-4 text-emerald-900 font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-emerald-900">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={1}
                  className="w-full bg-emerald-50/50 border-none rounded-xl p-4 text-emerald-900 font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Travel DNA Sliders */}
          <section className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-900/40">Travel DNA Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Adventure Pulse */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-900">
                    <Zap size={20} className="text-emerald-600" />
                    <span className="font-bold">Adventure Pulse</span>
                  </div>
                  <span className="text-emerald-600 font-black">{formData.travel_dna?.adventure_pulse}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={formData.travel_dna?.adventure_pulse || 50}
                  onChange={(e) => handleDNAChange("adventure_pulse", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Gastronomy Level */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-900">
                    <Utensils size={20} className="text-emerald-600" />
                    <span className="font-bold">Gastronomy Level</span>
                  </div>
                  <span className="text-emerald-600 font-black">{formData.travel_dna?.gastronomy_level}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={formData.travel_dna?.gastronomy_level || 50}
                  onChange={(e) => handleDNAChange("gastronomy_level", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </section>

          {/* Qualitative DNA */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Diamond size={16} className="text-emerald-600" />
                Luxury Preference
              </label>
              <textarea 
                placeholder="e.g., Prioritizes privacy and high-end amenities..."
                value={formData.travel_dna?.secluded_luxury || ""}
                onChange={() => handleDNAChange("secluded_luxury", 0)} // Note: Simplified for this demo
                className="w-full bg-emerald-50/50 border-none rounded-xl p-4 text-emerald-900 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none h-24"
                onBlur={(e) => setFormData(prev => ({ 
                  ...prev, 
                  travel_dna: { ...prev.travel_dna, secluded_luxury: e.target.value } 
                }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Map size={16} className="text-emerald-600" />
                Cultural Interest
              </label>
              <textarea 
                placeholder="e.g., Deep dives into local traditions..."
                value={formData.travel_dna?.cultural_enthusiast || ""}
                className="w-full bg-emerald-50/50 border-none rounded-xl p-4 text-emerald-900 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none h-24"
                onBlur={(e) => setFormData(prev => ({ 
                  ...prev, 
                  travel_dna: { ...prev.travel_dna, cultural_enthusiast: e.target.value } 
                }))}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  travel_dna: { ...prev.travel_dna, cultural_enthusiast: e.target.value } 
                }))}
              />
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-emerald-50 bg-emerald-50/10 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-4 rounded-xl font-bold text-emerald-900 hover:bg-emerald-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-3 bg-emerald-900 text-white px-10 py-4 rounded-xl font-bold shadow-premium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
