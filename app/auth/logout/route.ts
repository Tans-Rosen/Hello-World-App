import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectToLogin = NextResponse.redirect(new URL("/login", request.url));
  const supabase = createClientForRouteHandler(request, redirectToLogin);
  await supabase.auth.signOut();
  return redirectToLogin;
}
