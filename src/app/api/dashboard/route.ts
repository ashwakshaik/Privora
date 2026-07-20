import { NextResponse } from "next/server";
import { DashboardService } from "@/services/DashboardService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing required parameter userId" }, { status: 400 });
    }

    const [scoreData, alerts, timeline, recommendations, monitoring] = await Promise.all([
      DashboardService.getPrivacyScore(userId),
      DashboardService.getRecentAlerts(userId),
      DashboardService.getTimeline(userId),
      DashboardService.getRecommendations(userId),
      DashboardService.getMonitoring(userId)
    ]);

    return NextResponse.json({
      score: scoreData.score,
      risk: scoreData.risk,
      alerts,
      timeline,
      recommendations,
      monitoring
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
