"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ToastProvider, useToast } from "./_components/Toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/projects", label: "Projects", icon: "folder" },
  { href: "/admin/project-categories", label: "Proj. Categories", icon: "category" },
  { href: "/admin/skills", label: "Skills", icon: "palette" },
  { href: "/admin/skill-categories", label: "Skill Categories", icon: "bookmark" },
  { href: "/admin/experiences", label: "Experience", icon: "work" },
  { href: "/admin/educations", label: "Education", icon: "school" },
  { href: "/admin/social-links", label: "Social Links", icon: "link" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

const SESSION_DURATION = 60 * 60 * 1000;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const INACTIVITY_WARN_BEFORE = 60 * 1000;
const CHECK_INTERVAL = 30 * 1000;

function SessionMonitor({ onExpired }: { onExpired: () => void }) {
  const { showToast } = useToast();
  const lastActivity = useRef(Date.now());
  const warned = useRef(false);

  const handleActivity = useCallback(() => {
    lastActivity.current = Date.now();
    warned.current = false;
  }, []);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const loginTimestamp = parseInt(localStorage.getItem("login_timestamp") ?? "0");
      const now = Date.now();

      if (loginTimestamp && now - loginTimestamp > SESSION_DURATION) {
        onExpired();
        return;
      }

      const inactiveDuration = now - lastActivity.current;

      if (inactiveDuration >= INACTIVITY_TIMEOUT) {
        onExpired();
        return;
      }

      if (
        !warned.current &&
        inactiveDuration >= INACTIVITY_TIMEOUT - INACTIVITY_WARN_BEFORE
      ) {
        warned.current = true;
        showToast("info", "Session will expire in 1 minute due to inactivity.");
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [onExpired, showToast]);

  return null;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/admin/login");
      } else if (session) {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSessionExpired = useCallback(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      window.location.href = "/admin/login";
    });
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[0.85rem] text-on-surface-muted">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SessionMonitor onExpired={handleSessionExpired} />
      <div className="min-h-screen bg-surface flex">
        <aside className="w-[240px] bg-surface-card border-r flex flex-col flex-shrink-0">
          <div className="px-6 py-6 border-b">
            <Link
              href="/admin"
              className="font-display text-xl font-extrabold text-on-surface no-underline tracking-tight"
            >
              Bi<span className="text-primary">ma</span>
              <span className="text-[0.7rem] text-on-surface-muted font-body font-normal ml-2">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.875rem] font-medium no-underline transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-primary-muted text-primary"
                    : "text-on-surface-muted hover:bg-surface-low"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 border-t">
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/admin/login";
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[0.875rem] font-medium text-on-surface-muted hover:bg-surface-low w-full border-none cursor-pointer bg-transparent transition-all duration-200"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ToastProvider>
  );
}
