"use client";

import { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs"; // Temporarily disabled
// import { useRouter } from "next/navigation"; // Temporarily disabled
import NavigationController from "./NavigationController";
import { useScreenSize } from "@/hooks/useScreenSize";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isMobile, isLoaded } = useScreenSize();

  // Original auth logic (commented out)
  // const { isSignedIn, isLoaded } = useUser(); // Temporarily disabled
  // const router = useRouter(); // Temporarily disabled
  // useEffect(() => {
  //   if (isLoaded && !isSignedIn) {
  //     router.push("/sign-in");
  //   }
  // }, [isSignedIn, isLoaded, router]);

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Show loading state until screen size is determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationController onCollapseChange={handleCollapseChange} />
      
      {/* Main Content - responsive to screen size and sidebar state */}
      
      <div className={`transition-all duration-300 ${
        isMobile 
          ? "pt-16" // Space for mobile top nav
          : sidebarCollapsed 
            ? "md:pl-20" 
            : "md:pl-64"
      }`}>
        <main className={`p-4 lg:p-8 ${
          isMobile || sidebarCollapsed ? "max-w-none" : "max-w-7xl mx-auto"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}