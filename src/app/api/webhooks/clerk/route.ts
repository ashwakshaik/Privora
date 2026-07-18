import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { data, type } = payload;

    // Log the received event type for debugging
    console.log(`[Clerk Webhook] Received event type: ${type}`);

    // Standard Clerk Event Handler
    if (type === "user.created" || type === "user.updated") {
      const id = data.id;
      const email = data.email_addresses?.[0]?.email_address;
      const first_name = data.first_name || "";
      const last_name = data.last_name || "";

      if (!id || !email) {
        return NextResponse.json({ error: "Missing required user fields" }, { status: 400 });
      }

      // Sync data to Supabase Database
      const syncedUser = await db.syncUser(id, email, first_name, last_name);
      
      console.log(`[Clerk Webhook] Successfully synced user ${id} (${email}) to database.`);
      return NextResponse.json({ success: true, user: syncedUser }, { status: 200 });
    }

    if (type === "user.deleted") {
      const id = data.id;
      console.log(`[Clerk Webhook] User ${id} deleted (Delete trigger can be handled if needed).`);
      // Optional: Delete user from database if desired:
      // await supabase.from('users').delete().eq('id', id);
      return NextResponse.json({ success: true, message: "Delete registered" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Unhandled event type" }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Clerk Webhook] Verification or execution failed:", error);
    const msg = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
