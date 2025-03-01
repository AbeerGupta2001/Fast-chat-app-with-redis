"use client"


import { useEffect, useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
import { cn } from "@/lib/utils"
import Sidebar from "../Sidebar"
import MessageContainer from "./MessageContainer"
import { User } from "@/db/dummy"
import { useSelectedUser } from "@/store/useSelectedUser"

interface ChatLayoutProps{
  defaultLayout: number[]|undefined
  users:User[]
}

const ChatLayout = ({defaultLayout=[320,480],users}:ChatLayoutProps) => {
  const [isMobile,setIsMobile] = useState(false)
  const [isCollapsed,setIsCollapsed] = useState(false)
  const {selectedUser} = useSelectedUser()
  useEffect(()=>{
   const checkScreenWidth  = ()=>{
    setIsMobile(window.innerWidth <= 768)
   } 
   checkScreenWidth()
   window.addEventListener("resize",checkScreenWidth);

   return ()=>{
    window.removeEventListener("resize",checkScreenWidth)
   }
  })
  return (
    <ResizablePanelGroup className="h-full items-stretch bg-background rounded-lg" onLayout={(sizes:number[])=>{
      document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)};`
    }} direction="horizontal">
      <ResizablePanel defaultSize={defaultLayout[0]} collapsedSize={8} collapsible={true} minSize={isMobile ? 0 : 24 } maxSize={isMobile ? 8 : 30} onCollapse={()=>{setIsCollapsed(true)
        document.cookie = `react-resizable-panels:collapsed=true;`
      }}
      onExpand={()=>{setIsCollapsed(false)
        document.cookie = `react-resizable-panels:collapsed=false;`
      }}
      className={cn(isCollapsed && "min-w-[80px] transition-all duration-300")}
      >
        <Sidebar isCollapsed={isCollapsed} users={users} />
      </ResizablePanel>
      <ResizableHandle withHandle/>
      <ResizablePanel
      defaultSize={defaultLayout[1]}
      minSize={30}
      >
        {selectedUser ? (<MessageContainer/>) : (<div className="flex justify-center items-center h-full w-full px-10">
          <div className="flex flex-col justify-center items-center gap-4">
            <img src="/logo.png" alt="logo" className="w-full md:w-2/3 lg:w-1/2" />
            <p className="text-muted-foreground text-center">Click on a chat to view the message</p>
          </div>
        </div>)}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
export default ChatLayout