import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function getRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }

  return `${appUrl}/api/auth/google/callback`;
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET" },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "email",
      "profile"
    ]
  });

  return NextResponse.redirect(authUrl);
}