"use client";

import { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs"; // Temporarily disabled
// import { useRouter } from "next/navigation"; // Temporarily disabled
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Original auth logic (commented out)
  // const { isSignedIn, isLoaded } = useUser(); // Temporarily disabled
  // const router = useRouter(); // Temporarily disabled
  // useEffect(() => {
  //   if (isLoaded && !isSignedIn) {
  //     router.push("/sign-in");
  //   }
  // }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content - responsive to sidebar state */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      }`}>
        <main className={`p-4 lg:p-8 ${
          sidebarCollapsed ? "max-w-none" : "max-w-7xl mx-auto"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}