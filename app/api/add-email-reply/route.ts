import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { messageId, replyText } = await request.json();

    if (!messageId || !replyText) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase.from("message_replies").insert({
      message_id: messageId,
      reply_text: replyText,
      sender: "visitor",
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to add email reply:", error);
    return Response.json({ error: "Failed to add email reply" }, { status: 500 });
  }
}
