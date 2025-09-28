"use client";

import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";

/**
 * NavigationController decides which nav to render.
 * It MUST NOT call useScreenSize itself if parent already provides values.
 */
export default function NavigationController({
  isMobile,
  // isLoaded,
  onCollapseChange,
}) {
  // If screen-size not ready, render nothing (prevents hydration mismatch)
  // if (!isLoaded) return null;

  // Render exactly one navigation UI
  if (isMobile) {
    return <MobileNavigation />;
  }

  
console.log("Render MobileNavigation");

  return <DesktopNavigation onCollapseChange={onCollapseChange} />;
}
