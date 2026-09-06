import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured in environment variables." },
      { status: 500 }
    );
  }

  // Derive base URL. Prefer the explicit public URL; fall back to the request origin.
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.") ? "http" : "https";
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    `${protocol}://${host}`
  ).replace(/\/$/, "");
  const redirectUri = `${appUrl}/api/auth/callback/github`;

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "repo,read:user");
  githubAuthUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(githubAuthUrl.toString());
}
