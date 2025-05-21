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
                  className="group relative overflow-hidden mx-2 rounded-xl hover:bg-primary/10 transition-all duration-300"
                >
                  {/* Icon container with enhanced styling */}
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 mr-2">
                    {item.icon && <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />}
                  </div>

                  {/* Text with enhanced styling */}
                  <span className="font-medium group-hover:text-primary transition-colors duration-300">{item.title}</span>

                  {/* Arrow with enhanced animation */}
                  <ChevronRight className="ml-auto h-4 w-4 text-primary/50 group-hover:text-primary transition-all duration-300 group-data-[state=open]/collapsible:rotate-90 group-hover:translate-x-0.5" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url} className="group flex items-center px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-300 ml-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/30 mr-2 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"></div>
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">{subItem.title}</span>
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
