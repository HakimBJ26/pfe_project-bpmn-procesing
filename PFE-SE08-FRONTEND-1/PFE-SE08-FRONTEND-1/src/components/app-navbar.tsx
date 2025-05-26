import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Menu,
  X,
  Settings,
  HelpCircle,
  User,
  Shield,
  Activity,
  Clock,
  Globe,
  ChevronDown,
  LogOut,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function AppNavbar() {
  const { username, logout } = useAuthStore();
  const { open, setOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notification data
  const notificationList = [
    { id: 1, title: 'New workflow deployed', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Task requires attention', time: '5 min ago', type: 'warning' },
    { id: 3, title: 'System maintenance scheduled', time: '1 hour ago', type: 'info' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${scrolled
        ? "bg-white backdrop-blur-lg shadow-md border-b border-gray-200"
        : "bg-white backdrop-blur-md border-b border-gray-100"
        }`}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section - Toggle and Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="relative hidden md:flex items-center max-w-md flex-1">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pr-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-l-md"
            />
            <Button
              size="sm"
              className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600 text-white border-blue-500 rounded-l-none rounded-r-md"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Status Indicators - Hidden on small screens */}
          <div className="hidden lg:flex items-center gap-3 ml-4">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-200">
              <Activity className="h-3 w-3" />
              <span>System Online</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">
              <Clock className="h-3 w-3" />
              <span>24 Active Tasks</span>
            </div>
          </div>
        </div>

        {/* Center section - Logo for mobile */}
        <div className="md:hidden flex items-center">
          <img
            alt="Workflow Hub"
            src="w_logo.png"
            className="h-8 w-auto"
          />
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-gray-600 hover:bg-gray-100"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Language Selector */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-1 text-gray-600 hover:bg-gray-100"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">EN</span>
          </Button>

          {/* Notifications with Dropdown */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-600 hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white animate-pulse"
                    variant="default"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-sidebar border-sidebar-border">
              <DropdownMenuLabel className="text-sidebar-foreground">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              {notificationList.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3 hover:bg-sidebar-accent">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-sidebar-foreground">{notification.title}</p>
                    <p className="text-xs text-sidebar-foreground/60 mt-1">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem className="text-center text-sidebar-primary hover:bg-sidebar-accent">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Administration Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:bg-gray-100"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm">Administration</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-sidebar border-sidebar-border">
              <DropdownMenuLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
                Administration
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <User className="h-4 w-4" />
                <span>User Management</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <Activity className="h-4 w-4" />
                <span>System Logs</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <Monitor className="h-4 w-4" />
                <span>System Monitoring</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-400/20">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-800">{username || 'Hakim Ben Jelloul'}</div>
                  <div className="text-xs text-gray-500">hakimbenjelloul26</div>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-sidebar border-sidebar-border">
              <DropdownMenuLabel className="p-3 border-b border-sidebar-border">
                <div className="text-sm font-medium text-sidebar-foreground">Hakim Ben Jelloul</div>
                <div className="text-xs text-sidebar-foreground/60">hakimbenjelloul26</div>
              </DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-sidebar-accent flex items-center gap-2"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
