"use client";

import { useScreenSize } from "@/hooks/useScreenSize";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";

export default function NavigationController({ onCollapseChange }) {
  const { isMobile, isLoaded } = useScreenSize();

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