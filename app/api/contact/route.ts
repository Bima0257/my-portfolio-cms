import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    const supabase = createClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);

    if (count !== null && count >= 5) {
      return Response.json(
        { error: "You have reached the maximum of 5 messages per day. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const { error: insertError } = await supabase
      .from("messages")
      .insert({ name, email, message });

    if (insertError) {
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
