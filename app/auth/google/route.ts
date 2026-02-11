import { NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "";

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing APP_BASE_URL" },
      { status: 500 }
    );
  }

  const redirectTo = `${baseUrl}/auth/callback`;
  const cookieCarrier = NextResponse.redirect(new URL("/", request.url));
  const supabase = createClientForRouteHandler(request, cookieCarrier);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(loginUrl);
  }

  if (!data?.url) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "oauth_no_url");
    return NextResponse.redirect(loginUrl);
  }

  const finalResponse = NextResponse.redirect(data.url);
  cookieCarrier.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });
  return finalResponse;
}
