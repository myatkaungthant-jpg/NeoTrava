"use client";

import React, { useState } from "react";
import { Upload, Sparkles, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const MagicImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus("idle");

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `itineraries/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("itineraries")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Trigger AI Processing (Gemini 1.5 Pro)
      setIsUploading(false);
      setIsProcessing(true);
      
      // MOCK: Simulating Gemini 1.5 Pro parsing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real implementation, you would call a Server Action or Edge Function here
      // that uses the Gemini 1.5 Pro API to parse the uploaded file.
      
      setStatus("success");
      setMessage("Itinerary parsed successfully! Trip 'Northern Escapade' has been created.");
      setFile(null);
    } catch (error: any) {
      console.error("Upload/Processing error:", error);
      setStatus("error");
      setMessage(error.message || "An error occurred during import.");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="glass-panel p-10 rounded-xl shadow-premium border border-white/20">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 bg-primary-fixed text-on-primary-fixed rounded-full text-[10px] font-bold tracking-widest uppercase">
            Magic Importer
          </div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight mb-4">
            Import from <span className="text-primary italic">Anything</span>.
          </h2>
          <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Upload your PDF, image, or screenshot of a travel itinerary. Our Gemini 1.5 Pro engine will extract every detail, cost, and location instantly.
          </p>
        </div>

        <div className={cn(
          "border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container-low/50",
          status === "success" ? "border-primary/30 bg-primary/5" : "border-outline-variant/30"
        )}>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || isProcessing}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            {status === "success" ? (
              <CheckCircle2 size={48} className="text-primary mb-2" />
            ) : status === "error" ? (
              <AlertCircle size={48} className="text-error mb-2" />
            ) : (
              <Upload size={48} className={cn("mb-2 transition-colors", file ? "text-primary" : "text-outline-variant")} />
            )}
            
            <span className="text-lg font-bold text-on-surface">
              {file ? file.name : "Select an itinerary document"}
            </span>
            <span className="text-sm text-on-surface-variant">
              Supports JPEG, PNG, and PDF
            </span>
          </label>
        </div>

        {file && !isUploading && !isProcessing && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleUpload}
              className="px-10 py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold text-lg shadow-premium hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <Sparkles size={20} />
              Start Magic Import
            </button>
          </div>
        )}

        {(isUploading || isProcessing) && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-primary font-bold">
              <Loader2 className="animate-spin" size={24} />
              {isUploading ? "Uploading to secure storage..." : "Gemini 1.5 Pro is parsing your document..."}
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-pulse transition-all" style={{ width: isUploading ? "40%" : "80%" }} />
            </div>
          </div>
        )}

        {message && (
          <div className={cn(
            "mt-8 p-4 rounded-lg flex items-center gap-3 text-sm font-medium",
            status === "success" ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
          )}>
            {status === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message}
          </div>
        )}
      </div>
      
      {/* Importer Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-surface-container-low rounded-xl flex gap-4">
          <div className="text-primary"><FileText size={24} /></div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">Cost Extraction</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Automatically detects THB prices and converts them into your budget tracker.</p>
          </div>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl flex gap-4">
          <div className="text-primary"><Sparkles size={24} /></div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">POI Verification</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Cross-references points of interest with the TAT Open API for accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
