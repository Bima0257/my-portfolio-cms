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
  position: string;
  company: string;
  url: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
}

export default function ExperiencesPage() {
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
    const { data: res } = await supabase.from("experiences").select("*").order("sort_order");
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("experiences").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("exp-form") as HTMLFormElement;
      const fd = new FormData(form);
      const payload: Record<string, any> = {
        position: fd.get("position") as string,
        company: fd.get("company") as string,
        url: (fd.get("url") as string) || "",
        start_date: fd.get("start_date") as string,
        end_date: (fd.get("end_date") as string) || null,
        is_current: fd.get("is_current") === "on",
        description: (fd.get("description") as string) || "",
        sort_order: editing?.sort_order ?? data.length + 1,
      };
      if (payload.is_current) payload.end_date = null;

      if (editing) {
        await supabase.from("experiences").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("experiences").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Experience updated." : "Experience added.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("experiences").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Experience deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Experience</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Experience
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Experience" onAdd={() => { setEditing(null); setModalOpen(true); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "position", label: "Position" },
            { key: "company", label: "Company" },
            { key: "start_date", label: "Start", render: (row) => row.start_date?.slice(0, 7) ?? "-" },
            { key: "is_current", label: "Current", render: (row) => row.is_current ? <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-semibold bg-green-100 text-green-600">Yes</span> : "-" },
          ]}
          data={data}
          onReorder={handleReorder}
          onEdit={(row) => { setEditing(row); setModalOpen(true); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Experience" : "Add Experience"} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSave} loading={saving}>
        <form id="exp-form" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Position</label>
              <input name="position" defaultValue={editing?.position ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Company</label>
              <input name="company" defaultValue={editing?.company ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">URL</label>
            <input name="url" defaultValue={editing?.url ?? ""}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Start Date</label>
              <input name="start_date" type="date" defaultValue={editing?.start_date?.slice(0, 10) ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">End Date</label>
              <input name="end_date" type="date" defaultValue={editing?.end_date?.slice(0, 10) ?? ""}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-[0.85rem] text-on-surface cursor-pointer">
            <input name="is_current" type="checkbox" defaultChecked={editing?.is_current ?? false}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
            Currently working here
          </label>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Description</label>
            <textarea name="description" defaultValue={editing?.description ?? ""} rows={3}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full resize-none" />
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Experience" message={`Delete "${deleteTarget?.position}" at ${deleteTarget?.company}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
