"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SortableTable from "../_components/SortableTable";
import FormModal from "../_components/FormModal";
import ConfirmDialog from "../_components/ConfirmDialog";
import EmptyState from "../_components/EmptyState";
import { revalidatePortfolio } from "../_utils/revalidate";
import { useToast } from "../_components/Toast";
import TranslatedField from "../_components/TranslatedField";

interface Item {
  id: number;
  institution: string;
  institution_id: string | null;
  degree: string;
  degree_id: string | null;
  field_of_study: string | null;
  field_of_study_id: string | null;
  start_year: number;
  end_year: number | null;
  description: string | null;
  description_id: string | null;
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
  const [degreeEn, setDegreeEn] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [institutionEn, setInstitutionEn] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [fieldOfStudyEn, setFieldOfStudyEn] = useState("");
  const [fieldOfStudyId, setFieldOfStudyId] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionId, setDescriptionId] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: res } = await supabase.from("educations").select("*").order("sort_order");
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (editing) {
      setDegreeEn(editing.degree ?? "");
      setDegreeId(editing.degree_id ?? "");
      setInstitutionEn(editing.institution ?? "");
      setInstitutionId(editing.institution_id ?? "");
      setFieldOfStudyEn(editing.field_of_study ?? "");
      setFieldOfStudyId(editing.field_of_study_id ?? "");
      setDescriptionEn(editing.description ?? "");
      setDescriptionId(editing.description_id ?? "");
    } else {
      setDegreeEn("");
      setDegreeId("");
      setInstitutionEn("");
      setInstitutionId("");
      setFieldOfStudyEn("");
      setFieldOfStudyId("");
      setDescriptionEn("");
      setDescriptionId("");
    }
  }, [editing]);

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
        degree: degreeEn,
        degree_id: degreeId,
        institution: institutionEn,
        institution_id: institutionId,
        field_of_study: fieldOfStudyEn,
        field_of_study_id: fieldOfStudyId,
        start_year: parseInt(fd.get("start_year") as string) || new Date().getFullYear(),
        end_year: fd.get("end_year") ? parseInt(fd.get("end_year") as string) : null,
        description: descriptionEn,
        description_id: descriptionId,
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
            <TranslatedField label="Degree" enValue={degreeEn} idValue={degreeId} onEnChange={setDegreeEn} onIdChange={setDegreeId} required />
            <TranslatedField label="Institution" enValue={institutionEn} idValue={institutionId} onEnChange={setInstitutionEn} onIdChange={setInstitutionId} required />
          </div>
          <TranslatedField label="Field of Study" enValue={fieldOfStudyEn} idValue={fieldOfStudyId} onEnChange={setFieldOfStudyEn} onIdChange={setFieldOfStudyId} />
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
          <TranslatedField label="Description" enValue={descriptionEn} idValue={descriptionId} onEnChange={setDescriptionEn} onIdChange={setDescriptionId} type="textarea" rows={4} />
        </form>
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Education" message={`Delete "${deleteTarget?.degree}" from ${deleteTarget?.institution}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
