"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Item {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: res } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (res) setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markAsRead = async (id: number) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
    setData(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-on-surface mb-6">Messages</h1>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-primary-muted rounded-[20px] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>mail</span>
          </div>
          <p className="text-[0.95rem] text-on-surface-muted">No messages yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div className="bg-surface-card rounded-[16px] border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-low">
                    <th className="py-3 px-4 text-left text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((msg) => (
                    <tr key={msg.id}
                      onClick={() => { setSelected(msg); if (!msg.is_read) markAsRead(msg.id); }}
                      className={`border-b border-outline-variant last:border-b-0 cursor-pointer transition-colors ${selected?.id === msg.id ? "bg-primary-muted/30" : "hover:bg-surface-low"} ${!msg.is_read ? "bg-primary-muted/10" : ""}`}
                    >
                      <td className="py-3 px-4">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${msg.is_read ? "bg-outline-variant" : "bg-primary"}`} />
                      </td>
                      <td className="py-3 px-4 text-[0.875rem] font-medium text-on-surface">{msg.name}</td>
                      <td className="py-3 px-4 text-[0.875rem] text-on-surface-muted">{msg.email}</td>
                      <td className="py-3 px-4 text-[0.875rem] text-on-surface-muted whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-card rounded-[16px] border border-outline-variant p-6 min-h-[300px]">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-[1.1rem] font-bold text-on-surface">{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} className="text-[0.85rem] text-primary no-underline hover:underline">{selected.email}</a>
                  </div>
                  <span className="text-[0.75rem] text-on-surface-muted whitespace-nowrap">
                    {new Date(selected.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="bg-surface-low rounded-[12px] p-4 mt-4">
                  <p className="text-[0.9rem] text-on-surface leading-[1.7] whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: 40 }}>mail_outline</span>
                <p className="text-[0.9rem] text-on-surface-muted mt-3">Select a message to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
