// Clerk middleware temporarily disabled for development
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/debug"
// ]);

// Temporary middleware that allows all routes
export default function middleware(req) {
  return NextResponse.next();
}

// Original Clerk middleware (commented out)
// export default clerkMiddleware((auth, req) => {
//   const { userId } = auth();
//   const isPublic = isPublicRoute(req);
//
//   // Protect private routes
//   if (!userId && !isPublic) {
//     const signInUrl = new URL("/sign-in", req.nextUrl.origin);
//     return NextResponse.redirect(signInUrl);
//   }
//
//   // Redirect authenticated users from root to dashboard
//   if (userId && req.nextUrl.pathname === "/") {
//     return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
//   }
//
//   return NextResponse.next();
// });

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};