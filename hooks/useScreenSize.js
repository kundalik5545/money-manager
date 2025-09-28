"use client";

import { useState, useEffect } from "react";

export function useScreenSize() {
  const [isMobile, setIsMobile] = useState(null); // null = not determined yet
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    // Check initial screen size
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return { isMobile, isLoaded: isMobile !== null };
}