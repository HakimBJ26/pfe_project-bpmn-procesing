import * as React from "react";
import {
  AudioWaveform,
  Command,
  Computer,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
// Theme is now hardcoded to light mode
import { Switch } from "@/components/ui/switch";
import { useGlobalStore } from "@/stores/global.store";

// This is sample data.
const data = {
  user: {
    name: "Hakim Ben Jelloul",
    email: "hakimbenjelloul26@gmail.com",
    avatar:
      "https://avatars.githubusercontent.com/u/57048839?s=400&u=49e3c75df36ce87c793d22ab207c17ab9c66b45d&v=4",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Workspace",
      url: "#",
      icon: Computer,
      isActive: true,
      items: [
        {
          title: "Tasks",
          url: "/tasks",
        },
        {
          title: "Processes",
          url: "/processes",
        },
        {
          title: "Workflows",
          url: "/workflows",
        },
        {
          title: "Forms",
          url: "/forms",
        },
        {
          title: "Decision Models",
          url: "/dmns",
        },
      ],
    },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Light theme is enforced, no theme switching allowed
  const { open } = useSidebar();
  const { developerMode, setDeveloperMode } = useGlobalStore();
  return (
    <Sidebar collapsible="icon" {...props} className="bg-white border-r border-gray-200 shadow-sm">
      <SidebarHeader className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-400/20 to-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Logo and Brand Section */}
        <div className="relative z-10 flex items-center justify-center py-6">
          {open ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Computer className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-800">
                  Workflow Hub
                </h1>
                <p className="text-xs text-gray-500">Process Management</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Computer className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Developer mode toggle with enhanced styling */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 mb-2 bg-gradient-to-r from-gray-50 to-blue-50 backdrop-blur-sm rounded-xl mx-3 border border-gray-200 shadow-sm">
          {open && (
            <span className="text-xs font-semibold flex items-center text-gray-700">
              <Computer className="h-3.5 w-3.5 mr-2 text-blue-500" />
              Developer Mode
            </span>
          )}
          <Switch
            checked={developerMode}
            onCheckedChange={() => setDeveloperMode(!developerMode)}
            title={!developerMode ? "Active Developer Mode" : "Inactive Developer Mode"}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 shadow-sm"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="relative px-2 py-4 bg-white">
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/5 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/5 to-transparent rounded-full blur-2xl animate-pulse delay-1500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-blue-400/3 to-purple-400/3 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Main navigation with enhanced styling */}
        <div className="relative z-10 space-y-2">
          <NavMain items={data.navMain} />
        </div>

        {/* Additional visual elements */}
        <div className="relative z-10 mt-8 px-3">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Status indicator */}
        <div className="relative z-10 mt-6 px-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            {open && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">System Online</span>
              </div>
            )}
            {!open && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto"></div>
            )}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="relative border-t border-gray-100 p-4 bg-white">
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-blue-400/5 via-purple-400/3 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl"></div>
        </div>

        {/* User info card with enhanced styling */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
            {open ? (
              <>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">HB</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    Hakim Ben Jelloul
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    hakimbenjelloul26@gmail.com
                  </p>
                </div>
              </>
            ) : (
              <div className="relative mx-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">HB</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats when expanded */}
        {open && (
          <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-center border border-blue-200">
              <div className="text-lg font-bold text-blue-700">12</div>
              <div className="text-xs text-blue-600">Active Tasks</div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-center border border-purple-200">
              <div className="text-lg font-bold text-purple-700">5</div>
              <div className="text-xs text-purple-600">Workflows</div>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
