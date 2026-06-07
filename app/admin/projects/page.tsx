"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SortableTable from "../_components/SortableTable";
import FormModal from "../_components/FormModal";
import ConfirmDialog from "../_components/ConfirmDialog";
import EmptyState from "../_components/EmptyState";
import { revalidatePortfolio } from "../_utils/revalidate";
import { useToast } from "../_components/Toast";
import FileUploader from "../_components/FileUploader";
import { uploadFile } from "@/lib/supabase/storage";
import IconPicker from "../_components/IconPicker";
import TranslatedField from "../_components/TranslatedField";

interface ProjectCategory {
  id: number;
  name: string;
}

interface Item {
  id: number;
  title: string;
  title_id: string | null;
  description: string;
  description_id: string | null;
  thumbnail: string | null;
  demo_url: string | null;
  github_url: string | null;
  gradient: string | null;
  icon: string | null;
  tags: string[] | null;
  cat: string | null;
  project_category_id: number | null;
  sort_order: number;
  project_categories?: { name: string } | null;
}

export default function ProjectsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<Item[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailRemove, setThumbnailRemove] = useState(false);
  const [iconValue, setIconValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [titleId, setTitleId] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [descriptionId, setDescriptionId] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [projRes, catRes] = await Promise.all([
      supabase.from("projects").select("*, project_categories!inner(name)").order("sort_order"),
      supabase.from("project_categories").select("id, name").order("sort_order"),
    ]);
    if (projRes.data) setData(projRes.data as unknown as Item[]);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("projects").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("project-form") as HTMLFormElement;
      const fd = new FormData(form);
      const tagsStr = (fd.get("tags") as string) || "";
      let thumbnail = editing?.thumbnail ?? null;
      if (thumbnailRemove) {
        thumbnail = null;
      } else if (thumbnailFile) {
        thumbnail = await uploadFile(supabase, "portfolio", "projects/thumbnails", thumbnailFile);
      }

      const payload = {
        title: titleValue,
        title_id: titleId || null,
        description: descriptionValue,
        description_id: descriptionId || null,
        thumbnail,
        demo_url: (fd.get("demo_url") as string) || null,
        github_url: (fd.get("github_url") as string) || null,
        gradient: (fd.get("gradient") as string) || "",
        icon: iconValue,
        tags: tagsStr ? tagsStr.split(",").map(t => t.trim()) : [],
        cat: fd.get("cat") as string || "",
        project_category_id: fd.get("project_category_id") ? parseInt(fd.get("project_category_id") as string) : null,
        sort_order: editing?.sort_order ?? data.length + 1,
      };

      if (editing) {
        await supabase.from("projects").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("projects").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      setThumbnailFile(null);
      setThumbnailRemove(false);
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Project updated." : "Project created.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("projects").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Project deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Projects</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); setIconValue(""); setTitleValue(""); setTitleId(""); setDescriptionValue(""); setDescriptionId(""); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Project
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Projects" onAdd={() => { setEditing(null); setModalOpen(true); setIconValue(""); setTitleValue(""); setTitleId(""); setDescriptionValue(""); setDescriptionId(""); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "thumbnail", label: "Thumb",
              render: (row) => row.thumbnail
                ? <img src={row.thumbnail} alt="" className="w-10 h-10 rounded-[8px] object-cover" />
                : <div className="w-10 h-10 rounded-[8px] bg-surface-low flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant" style={{fontSize:16}}>image</span></div>
            },
            { key: "title", label: "Title" },
            { key: "cat", label: "Cat", render: (row) => <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-primary-muted text-primary">{row.cat || "-"}</span> },
            { key: "project_categories", label: "Category", render: (row) => (row as any).project_categories?.name ?? "-" },
            { key: "tags", label: "Tags", render: (row) => (row.tags ?? []).slice(0, 2).join(", ") },
          ]}
          data={data}
          onReorder={handleReorder}
          onEdit={(row) => { setEditing(row); setModalOpen(true); setIconValue(row.icon ?? ""); setTitleValue(row.title); setTitleId(row.title_id ?? ""); setDescriptionValue(row.description); setDescriptionId(row.description_id ?? ""); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Project" : "Add Project"} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSave} loading={saving}>
        <form id="project-form" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TranslatedField label="Title" enValue={titleValue} idValue={titleId} onEnChange={setTitleValue} onIdChange={setTitleId} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Category</label>
              <select name="project_category_id" defaultValue={editing?.project_category_id ?? ""}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">cat slug</label>
              <input name="cat" defaultValue={editing?.cat ?? ""} placeholder="web / mobile / brand"
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Tags (comma separated)</label>
              <input name="tags" defaultValue={(editing?.tags ?? []).join(", ")}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Gradient CSS</label>
              <input name="gradient" defaultValue={editing?.gradient ?? ""}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <IconPicker value={iconValue} onChange={setIconValue} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUploader
              currentUrl={editing?.thumbnail ?? null}
              file={thumbnailFile}
              setFile={(f) => { setThumbnailFile(f); if (f) setThumbnailRemove(false); }}
              onRemove={() => setThumbnailRemove(true)}
              accept="image/*"
              label="Thumbnail"
              previewHeight="140px"
              type="image"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Demo URL</label>
              <input name="demo_url" defaultValue={editing?.demo_url ?? ""}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[0.85rem] font-semibold text-on-surface">GitHub URL</label>
            <input name="github_url" defaultValue={editing?.github_url ?? ""} placeholder="https://github.com/..."
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <TranslatedField label="Description" enValue={descriptionValue} idValue={descriptionId} onEnChange={setDescriptionValue} onIdChange={setDescriptionId} type="textarea" rows={4} />
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Project" message={`Delete "${deleteTarget?.title}"? This will also remove related skill associations.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
