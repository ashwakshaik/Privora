import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const { userId, scanId, rating, comment, helpful } = await req.json();

    if (!userId || !scanId || rating === undefined) {
      return NextResponse.json({ error: "Missing required parameters userId, scanId, or rating" }, { status: 400 });
    }

    const feedbackObj = await storage.submitScanFeedback(userId, scanId, rating, comment, helpful);
    return NextResponse.json({
      status: "success",
      feedback: feedbackObj
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
