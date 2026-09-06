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

  // CSRF protection: generate a per-request, cryptographically random `state`
  // and bind it to this browser via a short-lived httpOnly cookie. The callback
  // must present the matching value or the code exchange is rejected.
  const state = crypto.randomUUID();
  const isProd = process.env.NODE_ENV === "production";

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "repo,read:user");
  githubAuthUrl.searchParams.set("prompt", "consent");
  githubAuthUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(githubAuthUrl.toString());
  res.cookies.set("mdninja_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 600, // 10 minutes — ample for the OAuth round trip
    path: "/api/auth",
  });
  return res;
}
