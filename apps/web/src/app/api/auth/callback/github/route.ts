import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error || !code) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Authentication Failed</title></head>
        <body style="background:#090a0f;color:#ef4444;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h3>Authentication Failed</h3>
          <p>${errorDescription || error || "No authorization code received"}</p>
          <button onclick="window.close()" style="margin-top:16px;padding:8px 16px;cursor:pointer;">Close Window</button>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, { headers: { "Content-Type": "text/html" } });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missingConfigHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Configuration Missing</title></head>
        <body style="background:#090a0f;color:#f59e0b;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h3>OAuth Configuration Incomplete</h3>
          <p>GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in Vercel environment variables.</p>
        </body>
      </html>
    `;
    return new NextResponse(missingConfigHtml, { headers: { "Content-Type": "text/html" } });
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to obtain access token");
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "mdNinja-App",
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user profile from GitHub");
    }

    const userData = await userRes.json();

    const accountPayload = {
      username: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      token: accessToken,
    };

    // 3. Return postMessage HTML for client-side local isolation
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Connecting GitHub Account...</title></head>
        <body style="background:#090a0f;color:#f0f3fa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div style="text-align:center;">
            <h3>Connected ${userData.login}!</h3>
            <p style="color:#9aa3ba;font-size:13px;">Returning to mdNinja...</p>
          </div>
          <script>
            (function() {
              const data = {
                type: "GH_AUTH_SUCCESS",
                account: ${JSON.stringify(accountPayload)}
              };
              if (window.opener) {
                window.opener.postMessage(data, "*");
                setTimeout(function() { window.close(); }, 400);
              } else {
                window.location.href = "/";
              }
            })();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(successHtml, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="background:#090a0f;color:#ef4444;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h3>Connection Error</h3>
          <p>${(err as Error).message}</p>
          <button onclick="window.close()" style="margin-top:16px;padding:8px 16px;cursor:pointer;">Close Window</button>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, { headers: { "Content-Type": "text/html" } });
  }
}
