import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar } from "../ui/avatar";
import { USERS } from "@/db/dummy";
import { Info, X } from "lucide-react";
import { useSelectedUser } from "@/store/useSelectedUser";

const ChatTopbar = () => {
  const {selectedUser,setSelectedUser} = useSelectedUser()
  return (
    <div className="flex justify-between items-center w-full h-20 border-b p-4">
      {/* left side */}
      <div className="flex items-center gap-2">
        <Avatar className="flex justify-center items-center">
          <AvatarImage
            src={selectedUser?.image || "/user-placeholder.png"}
            alt="user-image"
            className="size-10 object-cover rounded-full"
          />
        </Avatar>

        <span className="font-medium">{selectedUser?.name}</span>
      </div>

      {/* right side */}
      <div className="flex gap-2">
        <Info className="text-muted-foreground cursor-pointer hover:text-primary"/>
        <X className="text-muted-foreground cursor-pointer hover:text-primary" onClick={()=>{
          setSelectedUser(null)
        }} />
      </div>
    </div>
  );
};
export default ChatTopbar;
