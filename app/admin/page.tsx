"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const cardDefs = [
  { label: "Projects", icon: "folder", href: "/admin/projects" },
  { label: "Skills", icon: "palette", href: "/admin/skills" },
  { label: "Experience", icon: "work", href: "/admin/experiences" },
  { label: "Education", icon: "school", href: "/admin/educations" },
  { label: "Messages", icon: "mail", href: "/admin/messages" },
  { label: "Unread", icon: "mark_email_unread", href: "/admin/messages" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .rpc("get_dashboard_counts")
      .single<{
        projects_count: number;
        skills_count: number;
        experiences_count: number;
        educations_count: number;
        messages_count: number;
        unread_messages_count: number;
      }>()
      .then(({ data, error }) => {
        if (data && !error) {
          setCounts({
            projects: Number(data.projects_count),
            skills: Number(data.skills_count),
            experience: Number(data.experiences_count),
            education: Number(data.educations_count),
            messages: Number(data.messages_count),
            unread: Number(data.unread_messages_count),
          });
        }
      });
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-on-surface mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cardDefs.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-surface-card rounded-[16px] p-6 border border-outline-variant no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-muted rounded-[12px] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>{card.icon}</span>
              </div>
              <div>
                <div className="text-[1.5rem] font-bold text-on-surface">
                  {counts ? counts[card.label.toLowerCase()] ?? 0 : (
                    <div className="w-10 h-6 bg-surface-low rounded animate-pulse" />
                  )}
                </div>
                <div className="text-[0.85rem] text-on-surface-muted">{card.label}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 bg-surface-card rounded-[16px] p-8 border border-outline-variant">
        <h2 className="font-display text-[1.1rem] font-bold text-on-surface mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/projects", label: "Add Project" },
            { href: "/admin/skills", label: "Add Skill" },
            { href: "/admin/experiences", label: "Add Experience" },
            { href: "/admin/educations", label: "Add Education" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold no-underline transition-all duration-200 hover:bg-primary-accent"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
