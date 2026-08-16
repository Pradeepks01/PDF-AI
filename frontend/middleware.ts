import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authRoutes = ["/sign-in"];

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const path = nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(path);
  const isDashboardRoute = path.startsWith("/dashboard");

  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET || "default_secret_key_1234567890",
  });

  // If already logged in and visiting sign-in page, redirect to account dashboard
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/account", request.url));
    }
    return NextResponse.next();
  }

  // If attempting to access dashboard without being authenticated, require sign-in
  if (isDashboardRoute && !token) {
    const callbackUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(new URL(`/sign-in?callbackUrl=${callbackUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"], 
};