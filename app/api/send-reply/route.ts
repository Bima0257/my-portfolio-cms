import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, replyToMessage, messageId } = await request.json();

    if (!to || !subject || !message) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    if (messageId) {
      await supabase.from("message_replies").insert({
        message_id: messageId,
        reply_text: message,
        sender: "admin",
      });
    }

    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
        
        <!-- Header -->
        <div style="background: #f8fafc; padding: 24px; border-radius: 8px 8px 0 0; border-bottom: 4px solid #3b82f6;">
          <h2 style="margin: 0; color: #0f172a;">
            Message from Bima Tri Wiyono
          </h2>
          <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">
            Full Stack Developer
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
          
          <p style="margin-top: 0; color: #334155; line-height: 1.8;">
            Hello,
          </p>

          <p style="color: #334155; line-height: 1.8;">
            Thank you for reaching out through my portfolio website.
            I appreciate your message and would like to respond as follows:
          </p>

          <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e293b; line-height: 1.8;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>

          ${
            replyToMessage
              ? `
            <div style="margin-top: 32px;">
              <p style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 10px;">
                YOUR ORIGINAL MESSAGE
              </p>

              <div style="
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #94a3b8;
              ">
                <p style="
                  margin: 0;
                  color: #475569;
                  font-size: 14px;
                  line-height: 1.7;
                ">
                  ${replyToMessage.replace(/\n/g, "<br>")}
                </p>
              </div>
            </div>
          `
              : ""
          }

          <!-- Signature -->
          <div style="margin-top: 32px;">
            <p style="margin-bottom: 4px; color: #334155;">
              Best regards,
            </p>

            <p style="
              margin: 0;
              font-weight: 700;
              color: #0f172a;
            ">
              Bima Tri Wiyono
            </p>

            <p style="
              margin: 4px 0 0;
              color: #64748b;
              font-size: 14px;
            ">
              Full Stack Developer
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="
          padding: 18px 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
        ">
          <p style="
            margin: 0;
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
          ">
            This message was sent in response to your inquiry submitted through
            my portfolio website.
          </p>
        </div>

      </div>
    `;

    await transporter.sendMail({
      from: `"Bima Tri Wiyono" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);

    return Response.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
