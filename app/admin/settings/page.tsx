"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePortfolio } from "../_utils/revalidate";
import { useToast } from "../_components/Toast";
import FileUploader from "../_components/FileUploader";
import TranslatedField from "../_components/TranslatedField";
import { uploadFile } from "@/lib/supabase/storage";

interface AboutData {
  id: number;
  name: string;
  age: number;
  expertise: string;
  tagline: string;
  experience: number;
  description: string;
  name_id?: string | null;
  expertise_id?: string | null;
  tagline_id?: string | null;
  description_id?: string | null;
  photo: string | null;
  cv_url: string | null;
  tools: string[];
  highlights: string[];
  stats: any[];
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoRemove, setPhotoRemove] = useState(false);
  const [cvRemove, setCvRemove] = useState(false);
  const [nameId, setNameId] = useState("");
  const [expertiseId, setExpertiseId] = useState("");
  const [taglineId, setTaglineId] = useState("");
  const [descriptionId, setDescriptionId] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("abouts").select("*").limit(1).single();
    if (data) {
      setAbout(data);
      setNameId(data.name_id ?? "");
      setExpertiseId(data.expertise_id ?? "");
      setTaglineId(data.tagline_id ?? "");
      setDescriptionId(data.description_id ?? "");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);

      let photo = about?.photo ?? null;
      let cvUrl = about?.cv_url ?? null;

      if (photoRemove) {
        photo = null;
      } else if (photoFile) {
        photo = await uploadFile(supabase, "portfolio", "abouts/photos", photoFile);
      }

      if (cvRemove) {
        cvUrl = null;
      } else if (cvFile) {
        cvUrl = await uploadFile(supabase, "portfolio", "abouts/cv", cvFile);
      }

      const payload = {
        name: about?.name ?? "",
        name_id: nameId || null,
        age: parseInt(fd.get("age") as string) || 0,
        expertise: about?.expertise ?? "",
        expertise_id: expertiseId || null,
        tagline: about?.tagline ?? "",
        tagline_id: taglineId || null,
        experience: parseInt(fd.get("experience") as string) || 0,
        description: about?.description ?? "",
        description_id: descriptionId || null,
        photo,
        cv_url: cvUrl,
        tools: ((fd.get("tools") as string) || "").split(",").map(t => t.trim()),
        highlights: ((fd.get("highlights") as string) || "").split("\n").map(t => t.trim()).filter(Boolean),
      };

      if (about?.id) {
        await supabase.from("abouts").update(payload).eq("id", about.id);
      } else {
        await supabase.from("abouts").insert(payload);
      }

      setSaving(false);
      setSaved(true);
      setPhotoFile(null);
      setCvFile(null);
      setPhotoRemove(false);
      setCvRemove(false);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Settings saved.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaving(false);
      showToast("error", "Failed to save settings.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Settings</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-green-600">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
            Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-surface-card rounded-[16px] border border-outline-variant p-8 max-w-[800px]">
        <div className="grid grid-cols-2 gap-5 mb-6">
          <TranslatedField label="Name" enValue={about?.name ?? ""} idValue={nameId} onEnChange={(v) => setAbout(prev => prev ? { ...prev, name: v } : null)} onIdChange={setNameId} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Age</label>
            <input name="age" type="number" defaultValue={about?.age ?? 0}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <TranslatedField label="Expertise" enValue={about?.expertise ?? ""} idValue={expertiseId} onEnChange={(v) => setAbout(prev => prev ? { ...prev, expertise: v } : null)} onIdChange={setExpertiseId} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Experience (years)</label>
            <input name="experience" type="number" defaultValue={about?.experience ?? 0}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
        </div>

        <TranslatedField label="Tagline" enValue={about?.tagline ?? ""} idValue={taglineId} onEnChange={(v) => setAbout(prev => prev ? { ...prev, tagline: v } : null)} onIdChange={setTaglineId} />

        <TranslatedField label="Description" enValue={about?.description ?? ""} idValue={descriptionId} onEnChange={(v) => setAbout(prev => prev ? { ...prev, description: v } : null)} onIdChange={setDescriptionId} type="textarea" rows={4} />

        <div className="grid grid-cols-2 gap-5 mb-5">
          <FileUploader
            currentUrl={about?.photo ?? null}
            file={photoFile}
            setFile={(f) => { setPhotoFile(f); if (f) setPhotoRemove(false); }}
            onRemove={() => setPhotoRemove(true)}
            accept="image/*"
            label="Photo"
            previewHeight="220px"
            type="image"
          />
          <FileUploader
            currentUrl={about?.cv_url ?? null}
            file={cvFile}
            setFile={(f) => { setCvFile(f); if (f) setCvRemove(false); }}
            onRemove={() => setCvRemove(true)}
            accept="application/pdf"
            label="CV (PDF)"
            type="file"
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-[0.85rem] font-semibold text-on-surface">Tools (comma separated)</label>
          <input name="tools" defaultValue={(about?.tools ?? []).join(", ")}
            className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
        </div>

        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[0.85rem] font-semibold text-on-surface">Highlights (one per line)</label>
          <textarea name="highlights" defaultValue={(about?.highlights ?? []).join("\n")} rows={4}
            className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full resize-none" />
        </div>

        <button type="submit" disabled={saving}
          className="bg-primary text-white px-8 py-2.5 rounded-full text-[0.9rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
