"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
// import { UserButton } from "@clerk/nextjs"; // Temporarily disabled
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
  Menu,
  X
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={`flex items-center gap-3 p-6 ${collapsed ? "justify-center" : ""}`}>
        <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0" />
        {!collapsed && <span className="text-xl font-bold text-foreground">FinanceHub</span>}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 pb-4">
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

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${collapsed ? "justify-center" : ""}`}
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
            className="w-full justify-start"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="ml-2">{darkMode ? "Light" : "Dark"} Mode</span>}
          </Button>
        </div>

        {/* User Profile - Temporarily disabled Clerk */}
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          {/* Temporary user avatar replacement */}
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

        {/* Collapse Toggle */}
        <div className="mt-4 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            <Menu className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 ${
        collapsed ? "lg:w-20" : "lg:w-64"
      } bg-background border-r transition-all duration-300`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">FinanceHub</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-bold">FinanceHub</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="pt-4">
                <SidebarContent />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}