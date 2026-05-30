"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SortableTable from "../_components/SortableTable";
import FormModal from "../_components/FormModal";
import ConfirmDialog from "../_components/ConfirmDialog";
import EmptyState from "../_components/EmptyState";
import { revalidatePortfolio } from "../_utils/revalidate";
import { useToast } from "../_components/Toast";

interface Item {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export default function ProjectCategoriesPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: res } = await supabase.from("project_categories").select("*").order("sort_order");
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("project_categories").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("proj-cat-form") as HTMLFormElement;
      const fd = new FormData(form);
      const payload = {
        name: fd.get("name") as string,
        slug: (fd.get("slug") as string) || (fd.get("name") as string)?.toLowerCase().replace(/\s+/g, "-"),
        sort_order: editing?.sort_order ?? data.length + 1,
      };

      if (editing) {
        await supabase.from("project_categories").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("project_categories").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Category updated." : "Category created.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save category.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("project_categories").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Category deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete category.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Project Categories</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Category
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Project Categories" onAdd={() => { setEditing(null); setModalOpen(true); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
          ]}
          data={data}
          onReorder={handleReorder}
          onEdit={(row) => { setEditing(row); setModalOpen(true); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Category" : "Add Category"} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSave} loading={saving}>
        <form id="proj-cat-form" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Name</label>
            <input name="name" defaultValue={editing?.name ?? ""} required
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Slug (optional)</label>
            <input name="slug" defaultValue={editing?.slug ?? ""}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Category" message={`Are you sure? Projects using "${deleteTarget?.name}" will lose their category.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
