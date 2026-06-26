import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/profile/:path*"
  ],
};
