"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // User is already signed in, redirect to dashboard
      console.log("User is already signed in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show redirect message
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <p className="text-gray-600">
              Start managing your personal finances today
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignUp 
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden"
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}