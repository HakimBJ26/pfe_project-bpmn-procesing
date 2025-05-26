"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="group relative overflow-hidden mx-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-primary/20"
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                  {/* Icon container with enhanced styling */}
                  <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-300 mr-3 shadow-sm group-hover:shadow-md">
                    {item.icon && <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  </div>

                  {/* Text with enhanced styling */}
                  <span className="relative font-semibold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">{item.title}</span>

                  {/* Arrow with enhanced animation */}
                  <ChevronRight className="relative ml-auto h-4 w-4 text-primary/60 group-hover:text-primary transition-all duration-300 group-data-[state=open]/collapsible:rotate-90 group-hover:translate-x-1" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem, index) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url} className="group flex items-center px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/8 hover:to-accent/4 transition-all duration-300 ml-3 mr-2 border border-transparent hover:border-primary/15 hover:shadow-sm">
                          {/* Enhanced indicator with animation */}
                          <div className="relative flex items-center justify-center h-6 w-6 mr-3">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 group-hover:from-primary group-hover:to-accent group-hover:scale-125 transition-all duration-300 shadow-sm"></div>
                            <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 scale-0 group-hover:scale-100"></div>
                          </div>

                          {/* Text with enhanced styling */}
                          <span className="text-sm font-medium text-sidebar-foreground/80 group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1">{subItem.title}</span>

                          {/* Subtle number indicator */}
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                          </div>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
