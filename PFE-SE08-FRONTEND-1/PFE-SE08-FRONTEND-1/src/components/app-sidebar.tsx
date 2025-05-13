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
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <a href="/">
          <div className="flex justify-center h-16 shrink-0 items-center">
            <img
              alt="Wevioo"
              src={`${
                state == "collapsed" ? "w_logo_cropped.png" : "w_logo.png"
              }`}
              className="h-8 w-auto"
            />
          </div>
        </a>

        <div className="flex items-center justify-center gap-2">
          {open && (
            <p
              className={`text-sm ${
                developerMode ? "text-black" : "text-gray-500"
              }`}
            >
              Developer Mode
            </p>
          )}
          <Switch
            checked={developerMode}
            onCheckedChange={() => setDeveloperMode(!developerMode)}
            title={!developerMode ? "Active Developer Mode" : "Inactive Developer Mode"}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {!isAdmin && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Administration" asChild>
                  <a href="/admin" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Administration</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        
        <Button
          onClick={() => setOpen(!open)}
          className="rounded-md flex items-center justify-center w-full"
        >
          {state == "collapsed" ? (
            <ArrowRightFromLine />
          ) : (
            <ArrowLeftFromLine />
          )}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
