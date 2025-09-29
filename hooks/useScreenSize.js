"use client";

import { useState, useEffect, useCallback } from "react";

export function useScreenSize() {
  const [isMobile, setIsMobile] = useState(null); // null = not determined yet
  
  const checkScreenSize = useCallback(() => {
    const newIsMobile = window.innerWidth < 768; // md breakpoint
    setIsMobile(prevIsMobile => {
      // Only update if the value actually changed to prevent unnecessary re-renders
      return prevIsMobile !== newIsMobile ? newIsMobile : prevIsMobile;
    });
  }, []);
  
  useEffect(() => {
    // Check initial screen size
    checkScreenSize();
    
    // Debounce resize events to prevent excessive re-renders
    let timeoutId;
    const debouncedCheckScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    
    // Listen for resize events
    window.addEventListener('resize', debouncedCheckScreenSize);
    
    return () => {
      window.removeEventListener('resize', debouncedCheckScreenSize);
      clearTimeout(timeoutId);
    };
  }, [checkScreenSize]);
  
  return { isMobile, isLoaded: isMobile !== null };
}