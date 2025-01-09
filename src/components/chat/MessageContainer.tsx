import { useEffect } from "react";
import ChatBottomBar from "./ChatBottomBar";
import ChatTopbar from "./ChatTopbar";
import MessageList from "./MessageList";
import { useSelectedUser } from "@/store/useSelectedUser";

const MessageContainer = () => {
  const {setSelectedUser} = useSelectedUser()
  useEffect(()=>{
    const escapeEvent = (e:KeyboardEvent)=>{
      if(e.key == "Escape"){
        setSelectedUser(null)
      }
    }
    document.addEventListener("keydown",escapeEvent)

    return ()=> removeEventListener("keydown",escapeEvent)
  },[])

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar />

      <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <MessageList />
        <ChatBottomBar />
      </div>
    </div>
  );
};
export default MessageContainer;
