"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "../_components/Toast";

const MAX_ATTEMPTS = 3;
const BASE_COOLDOWN = 30;

function getStoredAttempts(): number {
  try { return parseInt(sessionStorage.getItem("login_attempts") ?? "0"); } catch { return 0; }
}

function setStoredAttempts(n: number) {
  try { sessionStorage.setItem("login_attempts", String(n)); } catch {}
}

function getCooldownEnd(): number {
  try { return parseInt(sessionStorage.getItem("login_cooldown") ?? "0"); } catch { return 0; }
}

function setCooldownEnd(t: number) {
  try { sessionStorage.setItem("login_cooldown", String(t)); } catch {}
}

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const remaining = getCooldownEnd() - Date.now();
    if (remaining > 0) {
      setCooldown(Math.ceil(remaining / 1000));
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      const remaining = getCooldownEnd() - Date.now();
      if (remaining <= 0) {
        setCooldown(0);
        clearInterval(timerRef.current);
      } else {
        setCooldown(Math.ceil(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const attempts = getStoredAttempts() + 1;
      setStoredAttempts(attempts);

      if (attempts >= MAX_ATTEMPTS) {
        const cooldownSec = BASE_COOLDOWN * Math.pow(2, attempts - MAX_ATTEMPTS);
        setCooldownEnd(Date.now() + cooldownSec * 1000);
        setCooldown(cooldownSec);
        showToast("error", `Too many attempts. Try again in ${cooldownSec}s.`);
      } else {
        showToast("error", `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`);
      }

      setLoading(false);
      return;
    }

    setStoredAttempts(0);
    setCooldownEnd(0);
    showToast("success", "Login successful!");
    setTimeout(() => router.push("/admin"), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-[420px] mx-auto px-8">
        <div className="bg-surface-card rounded-[20px] p-10 border border-outline-variant">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-extrabold text-on-surface mb-1">
              Bin<span className="text-primary">jan</span>
            </h1>
            <p className="text-[0.85rem] text-on-surface-muted">Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-surface border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-surface border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-primary text-white px-6 py-3 rounded-[12px] text-[0.95rem] font-semibold border-none cursor-pointer transition-all duration-200 hover:bg-primary-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : cooldown > 0 ? `Wait ${cooldown}s` : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
