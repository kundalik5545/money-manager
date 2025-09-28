import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook/clerk"
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const isPublic = isPublicRoute(req);
  const isAuth = isAuthRoute(req);

  console.log(`[Middleware] Path: ${req.nextUrl.pathname}, UserId: ${userId ? 'authenticated' : 'not authenticated'}, IsPublic: ${isPublic}`);

  // Redirect unauthenticated users to sign-in for protected routes
  if (!userId && !isPublic) {
    console.log(`[Middleware] Redirecting to sign-in: ${req.url}`);
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages
  if (userId && isAuth) {
    console.log(`[Middleware] Authenticated user on auth page, redirecting to dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Redirect authenticated users from root to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    console.log(`[Middleware] Authenticated user on root, redirecting to dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};