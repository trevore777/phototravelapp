import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hasAccessToken = Boolean(req.cookies.get("google_access_token")?.value);
  const hasRefreshToken = Boolean(req.cookies.get("google_refresh_token")?.value);

  return NextResponse.json({
    connected: hasAccessToken || hasRefreshToken
  });
}