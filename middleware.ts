import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/api/webhook/clerk"
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const isPublic = isPublicRoute(req);
  const isAuth = isAuthRoute(req);

  // Redirect unauthenticated users to sign-in for protected routes
  if (!userId && !isPublic) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const signInUrl = new URL("/sign-in", baseUrl);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages
  if (userId && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect authenticated users from root to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};