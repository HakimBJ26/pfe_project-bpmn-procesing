"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth.store"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  const { logout } = useAuthStore()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent/20 data-[state=open]:text-sidebar-accent-foreground relative overflow-hidden group mx-2 rounded-xl"
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative z-10 flex items-center w-full">
                <Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-md">
                  <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-accent text-white font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                  <span className="truncate font-semibold group-hover:text-primary transition-colors duration-300">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-primary/50 group-hover:text-primary transition-colors duration-300" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border-0 shadow-lg bg-white/95 backdrop-blur-sm"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 p-3 text-left text-sm bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
                <Avatar className="h-12 w-12 rounded-xl ring-2 ring-primary/20 shadow-md">
                  <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-accent text-white font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem className="rounded-lg flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-primary/5 transition-colors duration-200">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <span className="font-medium">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-primary/5 transition-colors duration-200">
                <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                  <Bell className="h-4 w-4" />
                </div>
                <span className="font-medium">Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="opacity-50" />
            <div className="p-1">
              <DropdownMenuItem
                onClick={() => logout()}
                className="rounded-lg flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-destructive/5 text-destructive hover:text-destructive transition-colors duration-200"
              >
                <div className="p-1.5 rounded-md bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
