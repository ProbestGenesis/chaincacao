"use client"

import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
} from "@/components/ui/sidebar";
import {
    CircleQuestionMark,
    LayoutDashboardIcon,
    LogOut,
    PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AppSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) =>
    path === "/"
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`)

  const navButtonClass = (active: boolean) =>
    [
      "flex w-full space-x-4.5 rounded-md border-2 fl-text-sm/lg",
      active && "bg-primary text-primary-foreground hover:bg-primary/90",
    ]
      .filter(Boolean)
      .join(" ")
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-row space-x-2">
          <h2 className="fl-text-lg/3xl leading-tight font-extrabold tracking-tight antialiased">
            ChainCacao
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className=" ">
          <SidebarGroupLabel>Pages</SidebarGroupLabel>

          <SidebarGroupContent className="flex flex-col space-y-2.5">
            <Link href="/" >
              {" "}
              <Button
                className={navButtonClass(isActive("/"))}
                variant={isActive("/") ? "default" : "outline"}
              >
                <LayoutDashboardIcon />{" "}
                <p className="flex-1 text-left"> Taleau de bord </p>
              </Button>
            </Link>

           <Link href="/inventory" >
             <Button
              className={navButtonClass(isActive("/inventory"))}
              variant={isActive("/inventory") ? "default" : "outline"}
            >
              <LayoutDashboardIcon />{" "}
              <p className="flex-1 text-left">Gestion des lots </p>
             </Button>
           </Link>

           <Link href="/expedition" >
             <Button
              className={navButtonClass(isActive("/expedition"))}
              variant={isActive("/expedition") ? "default" : "outline"}
            >
              <LayoutDashboardIcon />{" "}
              <p className="flex-1 text-left"> Transport </p>
             </Button>
           </Link>

           <Link href="/shipments" >
               <Button
              className={navButtonClass(isActive("/shipments"))}
              variant={isActive("/shipments") ? "default" : "outline"}
            >
              <LayoutDashboardIcon />{" "}
              <p className="flex-1 text-left">Espéditions</p>
            </Button>
            </Link>

           <Link href="/reports" >
             <Button
              className={navButtonClass(isActive("/reports"))}
              variant={isActive("/reports") ? "default" : "outline"}
            >
              <LayoutDashboardIcon />{" "}
              <p className="flex-1 text-left">Rapports</p>
            </Button>
           </Link>
          
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="secondary" className="rounded-md">
          <PlusIcon />
          <p className="flex-1 text-left">Nouvelle Reception</p>
        </Button>

        <div className="mt-6.5 flex flex-col space-y-2.5">
          <Button variant="ghost" className="rounded-md">
            <CircleQuestionMark /> <p className="flex-1 text-left">Support</p>
          </Button>

          <Button variant="ghost" className="rounded-md">
            <LogOut /> <p className="flex-1 text-left">Se déconnecter</p>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
