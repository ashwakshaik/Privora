import { NextResponse } from "next/server";
import { monitoringScheduler } from "@/scan-engine/MonitoringScheduler";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const sweepResult = await monitoringScheduler.runDailySweeps();
    return NextResponse.json({
      status: "success",
      ...sweepResult
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
