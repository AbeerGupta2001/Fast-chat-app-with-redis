

import { User, USERS } from "@/db/dummy";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { useSelectedUser } from "@/store/useSelectedUser";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface SidebarProps{ 
  isCollapsed: boolean 
  users:User[]
}


const Sidebar = ({ isCollapsed,users }:SidebarProps ) => { 

  const [playClickSound] = useSound("/sounds/mouse-click.mp3");
  const { soundEnabled, setSoundEnabled } = usePreferences();
  const {setSelectedUser,selectedUser} = useSelectedUser()
  const {user} = useKindeBrowserClient()

  return (
    <div className="group relative flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 max-h-full overflow-auto bg-background">
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
          </div>
        </div>
      )}
      <ScrollArea className="gap-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {users.map((user, idx) =>
          isCollapsed ? (
            <TooltipProvider key={idx+1}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      soundEnabled && playClickSound();
                    }}
                  >
                    <Avatar className="my-1 flex justify-center items-center">
                      <AvatarImage
                        src={user.image || "/user-placeholder.png"}
                        alt="user-image"
                        width={6}
                        height={6}
                        className="border-2 border-white rounded-full w-10 h-10"
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{user.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {user.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
            key={user.id}
              className={cn(
                "w-full justify-start gap-4 my-1",
                selectedUser?.email === user.email &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink"
              )}
              variant={"gray"}
              size={"xl"}
              onClick={() => {
                soundEnabled && playClickSound();
                setSelectedUser(user)
              }}
            >
              <Avatar className="my-1 flex justify-center items-center">
                <AvatarImage
                  src={user.image || "/user-placeholder.png"}
                  alt="user-image"
                  className="border-2 border-white rounded-full w-10 h-10"
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span className="font-semibold">{user.name}</span>
              </div>
            </Button>
          )
        )}
      </ScrollArea>

      <div className="mt-auto">
        <div className="flex justify-between md:px-6 py-2 gap-3 items-center">
          {!isCollapsed && (
            <div className="hidden md:flex gap-2 items-center">
              <Avatar className="my-1 flex justify-center items-center">
                <AvatarImage
                  src={ user?.picture ||"/user-placeholder.png"}
                  alt="user-image"
                  className="border-2 border-white rounded-full w-10 h-10"
                />
                <AvatarFallback>{user?.given_name![0]}</AvatarFallback>
              </Avatar>
              <p className="font-bold">{`${user?.given_name} ${user?.family_name}`}</p>
            </div>
          )}
          <div className="flex">
            <LogoutLink>
              <LogOutIcon size={22} cursor={"pointer"} />
            </LogoutLink>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
