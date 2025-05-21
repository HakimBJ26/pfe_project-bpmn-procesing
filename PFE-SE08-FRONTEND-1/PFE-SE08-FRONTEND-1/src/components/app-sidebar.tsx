import * as React from "react";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  AudioWaveform,
  Command,
  Computer,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
// Theme is now hardcoded to light mode
import { Button } from "./ui/button";
import { Switch } from "@/components/ui/switch";
import { useGlobalStore } from "@/stores/global.store";
import { useAuthStore } from "@/stores/auth.store";

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
    {
      title: "Camunda Modelers",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Workflow Builder",
          url: "/workflow-builder",
        },
        // {
        //   title: "Process Builder",
        //   url: "/process-builder",
        // },
        {
          title: "Form Builder",
          url: "/form-builder",
        },
        {
          title: "Decision Model Builder",
          url: "/dmn-builder",
        },
      ],
    },
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
  const { state, setOpen, open } = useSidebar();
  const { developerMode, setDeveloperMode } = useGlobalStore();
  const { isAdmin } = useAuthStore();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
        </div>

        {/* Logo with enhanced styling */}
        <a href="/" className="relative z-10 transition-all duration-300 hover:opacity-90 block">
          <div className="flex justify-center h-20 shrink-0 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-md transform scale-90"></div>
              <img
                alt="Wevioo"
                src={`${state == "collapsed" ? "w_logo_cropped.png" : "w_logo.png"}`}
                className="h-12 w-auto relative z-10 drop-shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </a>

        {/* Developer mode toggle with enhanced styling */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 mt-2 bg-sidebar-accent/10 backdrop-blur-sm rounded-lg mx-2">
          {open && (
            <span className="text-xs font-medium flex items-center">
              <Computer className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Developer Mode
            </span>
          )}
          <Switch
            checked={developerMode}
            onCheckedChange={() => setDeveloperMode(!developerMode)}
            title={!developerMode ? "Active Developer Mode" : "Inactive Developer Mode"}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 left-0 w-40 h-40 bg-accent/5 rounded-full blur-xl"></div>
        </div>

        {/* Main navigation with enhanced styling */}
        <div className="relative z-10">
          <NavMain items={data.navMain} />
        </div>

        {/* Administration panel with enhanced styling */}
        {!isAdmin && (
          <SidebarGroup className="mt-6 relative z-10">
            <div className="px-4 py-2 mb-2">
              <h3 className="text-xs font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wider">Administration</h3>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Administration Panel"
                  asChild
                  className="transition-all duration-300 hover:bg-primary/10 rounded-lg mx-2"
                >
                  <a href="/admin" className="flex items-center gap-3 group p-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors duration-300">Administration</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="space-y-4 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent"></div>
        </div>

        {/* User profile with enhanced styling */}
        <div className="relative z-10">
          <NavUser user={data.user} />
        </div>

        {/* Collapse button with enhanced styling */}
        <div className="relative z-10 px-2">
          <Button
            onClick={() => setOpen(!open)}
            className="rounded-xl flex items-center justify-center w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {state == "collapsed" ? (
              <ArrowRightFromLine className="h-4 w-4 animate-pulse" />
            ) : (
              <>
                <ArrowLeftFromLine className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Collapse Sidebar</span>
              </>
            )}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
