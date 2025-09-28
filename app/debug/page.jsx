"use client";

import { useUser, useAuth } from "@clerk/nextjs";

export default function DebugPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken, userId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Clerk Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Authentication Status</h2>
          <p>Is Signed In: {isSignedIn ? "Yes" : "No"}</p>
          <p>Is Loaded: {isLoaded ? "Yes" : "No"}</p>
          <p>User ID: {userId || "Not available"}</p>
        </div>

        {user && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">User Information</h2>
            <p>ID: {user.id}</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
            <p>First Name: {user.firstName}</p>
            <p>Last Name: {user.lastName}</p>
          </div>
        )}

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Current URL</h2>
          <p>{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Environment</h2>
          <p>Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    </div>
  );
}