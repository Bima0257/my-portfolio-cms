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
import TranslatedField from "../_components/TranslatedField";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface SkillCategory {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  name_id: string;
  level: string;
  percentage: number;
  icon: string | null;
  skill_category_id: number | null;
  sort_order: number;
  skill_categories?: { name: string } | null;
}

export default function SkillsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<Item[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [iconValue, setIconValue] = useState("");
  const [nameVal, setNameVal] = useState("");
  const [nameId, setNameId] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [skillsRes, catsRes] = await Promise.all([
      supabase.from("skills").select("*, skill_categories!inner(name)").order("sort_order"),
      supabase.from("skill_categories").select("id, name").order("sort_order"),
    ]);
    if (skillsRes.data) setData(skillsRes.data as unknown as Item[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReorder = async (ids: (string | number)[]) => {
    const updated = data.slice().sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))).map((item, i) => ({ ...item, sort_order: i + 1 }));
    setData(updated);
    for (const item of updated) {
      await supabase.from("skills").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    revalidatePortfolio();
    showToast("success", "Order updated.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = document.getElementById("skill-form") as HTMLFormElement;
      const fd = new FormData(form);
      const payload: Record<string, any> = {
        name: nameVal,
        name_id: nameId,
        level: fd.get("level") as string,
        percentage: parseInt(fd.get("percentage") as string) || 0,
        icon: iconValue,
        skill_category_id: fd.get("skill_category_id") ? parseInt(fd.get("skill_category_id") as string) : null,
        sort_order: editing?.sort_order ?? data.length + 1,
      };

      if (editing) {
        await supabase.from("skills").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("skills").insert(payload);
      }
      setSaving(false);
      setModalOpen(false);
      setEditing(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", editing ? "Skill updated." : "Skill created.");
    } catch {
      setSaving(false);
      showToast("error", "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("skills").delete().eq("id", deleteTarget.id);
      setDeleting(false);
      setDeleteTarget(null);
      fetchData();
      revalidatePortfolio();
      showToast("success", "Skill deleted.");
    } catch {
      setDeleting(false);
      showToast("error", "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Skills</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); setIconValue(""); setNameVal(""); setNameId(""); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add Skill
        </button>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState label="Skills" onAdd={() => { setEditing(null); setModalOpen(true); setIconValue(""); setNameVal(""); setNameId(""); }} />
      ) : (
        <SortableTable
          columns={[
            { key: "name", label: "Name" },
            { key: "percentage", label: "%",
              render: (row) => <div className="flex items-center gap-2"><div className="w-20 h-2 bg-surface-low rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${row.percentage}%` }} /></div><span className="text-[0.78rem] font-bold text-primary">{row.percentage}%</span></div>
            },
            { key: "level", label: "Level",
              render: (row) => {
                const colors: Record<string, string> = { Beginner: "bg-blue-100 text-blue-600", Intermediate: "bg-yellow-100 text-yellow-600", Advanced: "bg-orange-100 text-orange-600", Expert: "bg-green-100 text-green-600" };
                return <span className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold ${colors[row.level] ?? "bg-surface-low text-on-surface-muted"}`}>{row.level}</span>;
              }
            },
            { key: "skill_categories", label: "Category", render: (row) => (row as any).skill_categories?.name ?? "-" },
          ]}
          data={data}
          onReorder={handleReorder}
          onEdit={(row) => { setEditing(row); setModalOpen(true); setIconValue(row.icon ?? ""); setNameVal(row.name); setNameId(row.name_id ?? ""); }}
          onDelete={(row) => setDeleteTarget(row)}
          loading={loading}
        />
      )}

      <FormModal open={modalOpen} title={editing ? "Edit Skill" : "Add Skill"} onClose={() => { setModalOpen(false); setEditing(null); setNameVal(""); setNameId(""); }} onSubmit={handleSave} loading={saving}>
        <form id="skill-form" className="flex flex-col gap-4">
          <TranslatedField label="Name" enValue={nameVal} idValue={nameId} onEnChange={setNameVal} onIdChange={setNameId} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Level</label>
              <select name="level" defaultValue={editing?.level ?? "Intermediate"}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full">
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface">Percentage (0-100)</label>
              <input name="percentage" type="number" min={0} max={100} defaultValue={editing?.percentage ?? 0}
                className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-on-surface">Category</label>
            <select name="skill_category_id" defaultValue={editing?.skill_category_id ?? ""}
              className="bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary w-full">
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <IconPicker value={iconValue} onChange={setIconValue} />
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Skill" message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
