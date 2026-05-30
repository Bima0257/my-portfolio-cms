"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SortableTable from "../_components/SortableTable";
import FormModal from "../_components/FormModal";
import ConfirmDialog from "../_components/ConfirmDialog";
import EmptyState from "../_components/EmptyState";
import { revalidatePortfolio } from "../_utils/revalidate";
import { useToast } from "../_components/Toast";
import IconPicker from "../_components/IconPicker";
import Icon from "@/components/Icon";

interface Item {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  label: string | null;
  sort_order: number;
}

export default function SocialLinksPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [iconValue, setIconValue] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: res } = await supabase.from("social_links").select("*").order("sort_order");
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("social_links").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("social-form") as HTMLFormElement;
      const fd = new FormData(form);
      const payload = {
        name: fd.get("name") as string,
        url: fd.get("url") as string,
        icon: iconValue,
        label: (fd.get("label") as string) || "",
        sort_order: editing?.sort_order ?? data.length + 1,
      };

      if (editing) {
        await supabase.from("social_links").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("social_links").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      setIconValue("");
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Link updated." : "Link added.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("social_links").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Link deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Social Links</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); setIconValue(""); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Link
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Social Links" onAdd={() => { setEditing(null); setModalOpen(true); setIconValue(""); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "icon", label: "Icon", render: (row) => <Icon name={row.icon} size={20} className="text-primary" /> },
            { key: "name", label: "Name" },
            { key: "url", label: "URL", className: "max-w-[250px] truncate" },
            { key: "label", label: "Label" },
          ]}
          data={data}
          onReorder={handleReorder}
            onEdit={(row) => { setEditing(row); setModalOpen(true); setIconValue(row.icon ?? ""); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Social Link" : "Add Social Link"} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={handleSave} loading={saving}>
        <form id="social-form" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Name</label>
              <input name="name" defaultValue={editing?.name ?? ""} required
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Label (short text, e.g. "Dr")</label>
              <input name="label" defaultValue={editing?.label ?? ""} maxLength={10}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">URL</label>
            <input name="url" defaultValue={editing?.url ?? ""} required
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
          </div>
          <IconPicker value={iconValue} onChange={setIconValue} />
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Social Link" message={`Delete "${deleteTarget?.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
