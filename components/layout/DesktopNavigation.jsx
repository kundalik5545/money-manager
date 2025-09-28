"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Home, 
  CreditCard, 
  Receipt, 
  FolderOpen, 
  FileText,
  Settings,
  Search,
  Moon,
  Sun,
  Menu
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

export default function DesktopNavigation({ onCollapseChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or handle search
      console.log("Search query:", searchQuery);
      setSearchQuery("");
    }
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-background border-r ${
        collapsed ? "w-20" : "w-64"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0" />
            {!collapsed && <span className="text-xl font-bold text-foreground">FinanceHub</span>}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapse}
            className="p-2"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {/* Theme Toggle */}
          <div className={`flex items-center gap-3 mb-4 ${collapsed ? "justify-center" : ""}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className={collapsed ? "p-2" : "w-full justify-start"}
              title={collapsed ? (darkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : undefined}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span className="ml-2">{darkMode ? "Light" : "Dark"} Mode</span>}
            </Button>
          </div>

          {/* User Profile */}
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              D
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Demo User
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}