"use client";

import { useEffect } from "react";
import { useScreenSize } from "@/hooks/useScreenSize";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";

export default function NavigationController({ onCollapseChange, onScreenSizeChange }) {
  const { isMobile, isLoaded } = useScreenSize();

  // Notify parent of screen size changes
  useEffect(() => {
    if (onScreenSizeChange) {
      onScreenSizeChange(isMobile, isLoaded);
    }
  }, [isMobile, isLoaded, onScreenSizeChange]);

  // Don't render anything until screen size is determined to prevent hydration issues
  if (!isLoaded) {
    return null;
  }

  // Render only one navigation component based on screen size
  return isMobile ? (
    <MobileNavigation />
  ) : (
    <DesktopNavigation onCollapseChange={onCollapseChange} />
  );
}