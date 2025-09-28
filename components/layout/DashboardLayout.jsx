"use client";

import { useState } from "react";
// import { useUser } from "@clerk/nextjs"; // Temporarily disabled
// import { useRouter } from "next/navigation"; // Temporarily disabled
import NavigationController from "./NavigationController";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleScreenSizeChange = (mobile, loaded) => {
    console.log('Screen size changed:', { mobile, loaded }); // Debug log
    setIsMobile(mobile);
    setIsLoaded(loaded);
  };

  console.log('DashboardLayout render:', { isMobile, isLoaded }); // Debug log

  return (
    <div className="min-h-screen bg-background">
      <NavigationController 
        onCollapseChange={handleCollapseChange}
        onScreenSizeChange={handleScreenSizeChange}
      />
      
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
          {/* Show loading state until NavigationController is ready */}
          {!isLoaded ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}