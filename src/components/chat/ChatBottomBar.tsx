import { AnimatePresence, motion } from "framer-motion";
import {
  Image as ImageIcon,
  Loader,
  SendHorizonal,
  ThumbsUp,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { Button } from "../ui/button";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageAction } from "@/actions/message.action";
import { useSelectedUser } from "@/store/useSelectedUser";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { pusherClient } from "@/lib/pusher";
import { Message } from "@/db/dummy";


const ChatBottomBar = () => {
  const [message, setMessage] = useState("");
  const [imageUrl,setImageUrl] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { soundEnabled } = usePreferences();
  const { selectedUser } = useSelectedUser();
  const {user:currentUser} = useKindeBrowserClient()
  const [playSound1] = useSound("/sounds/keystroke1.mp3");
  const [playSound2] = useSound("/sounds/keystroke2.mp3");
  const [playSound3] = useSound("/sounds/keystroke3.mp3");
  const [playSound4] = useSound("/sounds/keystroke4.mp3");
  const queryClinet = useQueryClient()

  const soundArray = [playSound1, playSound2, playSound3, playSound4];

  const playRandomKeyStroke = () => {
    const randomIndex = Math.floor(Math.random() * soundArray.length);
    soundEnabled && soundArray[randomIndex]();
  };

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: sendMessageAction,
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage({
      content: message,
      messageType: "text",
      receiverId: selectedUser?.id!,
    });
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  
  useEffect(()=>{
    const channelName = `${currentUser?.id}__${selectedUser?.id}`.split("__").sort().join("__");
    const channel = pusherClient.subscribe(channelName)

    const handleNewMessage = (data:{message:Message})=>{
      queryClinet.setQueryData(["messages",selectedUser?.id],(oldMessages:Message[])=>{
        return [...oldMessages,data.message]
      })    
    }
  

    channel.bind("newMessage",handleNewMessage)


    return ()=>{
      channel.unbind("newMessage",handleNewMessage)
      pusherClient.unsubscribe(channelName)
    }
  },[currentUser?.id,selectedUser?.id,queryClinet])

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      <CldUploadWidget signatureEndpoint={"/api/sign-cloudinary-params"}
      onSuccess={(result,{widget})=>{
        setImageUrl((result.info as CloudinaryUploadWidgetInfo).secure_url)
        widget.close();
      }}
      >
        {({ open }) => {
          return (
            <ImageIcon
              size={20}
              className="cursor-pointer text-muted-foreground"
              onClick={() => open()}
            />
          );
        }}
      </CldUploadWidget>

        <Dialog open={!!imageUrl}>
          <DialogContent>
            <DialogHeader>
              Image Preview
            </DialogHeader>
            <div className="flex justify-center items-center relative h-96 w-full mx-auto">
              <Image src={imageUrl} alt="Image Preview" fill className="object-contain" />
            </div>
            <DialogFooter>
              <Button type="submit" onClick={()=>{
                sendMessage({content:imageUrl,messageType:"image",receiverId:selectedUser?.id!})
                setImageUrl("")
              }}>
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <AnimatePresence>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: {
              duration: 0.5,
            },
            layout: {
              type: "spring",
              bounce: 0.5,
            },
          }}
          className="w-full relative"
        >
          <Textarea
            autoComplete="off"
            placeholder="Aa"
            rows={1}
            className="w-full border rounded-full flex items-center h-9 min-h-0 resize-none overflow-hidden bg-background"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value);
              playRandomKeyStroke();
            }}
            ref={inputRef}
          />

          <div className="absolute bottom-0.5 right-2">
            <EmojiPicker
              onChange={(emoji) => {
                setMessage(message + emoji);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {message.trim() ? (
          <Button
            className="size-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-whtie shrink-0"
            variant={"ghost"}
            size={"icon"}
            onClick={handleSendMessage}
          >
            <SendHorizonal size={20} className="text-muted-foreground" />
          </Button>
        ) : (
          <Button
            className="size-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-whtie shrink-0"
            variant={"ghost"}
            size={"icon"}
          >
            {isPending ? (
              <Loader
                size={20}
                className="text-muted-foreground animate-spin"
              />
            ) : (
              <ThumbsUp
                size={20}
                className="text-muted-foreground"
                onClick={() => {
                  if (selectedUser)
                    sendMessage({
                      content: "Thumbs up",
                      messageType: "text",
                      receiverId: selectedUser?.id,
                    });
                }}
              />
            )}
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChatBottomBar;
