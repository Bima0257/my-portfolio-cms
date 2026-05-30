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
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_year: number;
  end_year: number | null;
  description: string | null;
  sort_order: number;
}

export default function EducationsPage() {
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
    const { data: res } = await supabase.from("educations").select("*").order("sort_order");
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("educations").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("edu-form") as HTMLFormElement;
      const fd = new FormData(form);
      const payload: Record<string, any> = {
        institution: fd.get("institution") as string,
        degree: fd.get("degree") as string,
        field_of_study: (fd.get("field_of_study") as string) || "",
        start_year: parseInt(fd.get("start_year") as string) || new Date().getFullYear(),
        end_year: fd.get("end_year") ? parseInt(fd.get("end_year") as string) : null,
        description: (fd.get("description") as string) || "",
        sort_order: editing?.sort_order ?? data.length + 1,
      };

      if (editing) {
        await supabase.from("educations").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("educations").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Education updated." : "Education added.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("educations").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Education deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Education</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Education
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Education" onAdd={() => { setEditing(null); setModalOpen(true); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "institution", label: "Institution" },
            { key: "degree", label: "Degree" },
            { key: "field_of_study", label: "Field" },
            { key: "start_year", label: "Year", render: (row) => `${row.start_year}${row.end_year ? ` — ${row.end_year}` : ""}` },
          ]}
          data={data}
          onReorder={handleReorder}
          onEdit={(row) => { setEditing(row); setModalOpen(true); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Education" : "Add Education"} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSave} loading={saving}>
        <form id="edu-form" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Institution</label>
              <input name="institution" defaultValue={editing?.institution ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Degree</label>
              <input name="degree" defaultValue={editing?.degree ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Field of Study</label>
            <input name="field_of_study" defaultValue={editing?.field_of_study ?? ""}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Start Year</label>
              <input name="start_year" type="number" defaultValue={editing?.start_year ?? new Date().getFullYear()} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">End Year (leave empty if current)</label>
              <input name="end_year" type="number" defaultValue={editing?.end_year ?? ""}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Description</label>
            <textarea name="description" defaultValue={editing?.description ?? ""} rows={3}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full resize-none" />
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Education" message={`Delete "${deleteTarget?.degree}" from ${deleteTarget?.institution}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
