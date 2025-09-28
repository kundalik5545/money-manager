"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Home, 
  CreditCard, 
  Receipt, 
  FolderOpen, 
  FileText,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Target,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Will be made active later
  const pathname = usePathname();

  // Initialize dark mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      
      setDarkMode(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleMenuItemClick = () => {
    setMobileOpen(false); // Close menu when item is clicked
  };

  const handleLogin = () => {
    // Will be implemented later
    console.log("Login functionality will be implemented");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    // Will be implemented later  
    console.log("Logout functionality will be implemented");
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">FinanceHub</span>
          </Link>
          
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Slide-out Menu Sheet */}
      {mobileOpen && (
        <>
          {/* Backdrop/Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Sheet */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-background border-l shadow-xl transition-transform"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex h-full flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-bold">FinanceHub</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-4">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleMenuItemClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Menu Footer */}
              <div className="p-4 space-y-4 border-t bg-muted/10">
                {/* Theme Toggle */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-2">Appearance</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="w-full justify-start px-4 py-3 h-auto"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="h-5 w-5 mr-3" />
                        <span>Switch to Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 mr-3" />
                        <span>Switch to Dark Mode</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* User Profile & Auth */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-2">Account</p>
                  
                  {/* User Profile */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Demo User</p>
                      <p className="text-xs text-muted-foreground truncate">demo@example.com</p>
                    </div>
                  </div>

                  {/* Login/Logout Buttons */}
                  <div className="space-y-1">
                    {isLoggedIn ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={true} // Will be enabled later
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Sign Out (Coming Soon)</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogin}
                        className="w-full justify-start px-4 py-3 h-auto text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={true} // Will be enabled later
                      >
                        <LogIn className="h-5 w-5 mr-3" />
                        <span>Sign In (Coming Soon)</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}