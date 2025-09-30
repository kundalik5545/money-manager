"use client";

import { useState } from "react";
import NavigationController from "./NavigationController";
import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children, bgColor }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const { isMobile, isLoaded } = useScreenSize(); // single source of truth
  const { isMobile } = useIsMobile();

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  console.log("Render DesktopNavigation");

  return (
    <div className={cn("min-h-screen", bgColor ? bgColor : "bg-background")}>
      {/* pass screen-size values down as props */}
      <NavigationController
        isMobile={isMobile}
        // isLoaded={isLoaded}
        onCollapseChange={handleCollapseChange}
      />

      {/* Main Content - responsive to screen size and sidebar state */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "pt-16" : sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <main
          className={`p-4 lg:p-8 ${
            isMobile || sidebarCollapsed ? "max-w-none" : "max-w-7xl mx-auto"
          }`}
        >
          {children}
          {/* Show loading state until screen size is determined */}
          {/* {!isLoaded ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            children
          )} */}
        </main>
      </div>
    </div>
  );
}
