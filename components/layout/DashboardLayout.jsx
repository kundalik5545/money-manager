"use client";

// import { useUser } from "@clerk/nextjs"; // Temporarily disabled
// import { useRouter } from "next/navigation"; // Temporarily disabled
// import { useEffect } from "react"; // Temporarily disabled
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  // const { isSignedIn, isLoaded } = useUser(); // Temporarily disabled
  // const router = useRouter(); // Temporarily disabled

  // Original auth logic (commented out)
  // useEffect(() => {
  //   if (isLoaded && !isSignedIn) {
  //     router.push("/sign-in");
  //   }
  // }, [isSignedIn, isLoaded, router]);

  // if (!isLoaded) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  // if (!isSignedIn) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}