"use server";

import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { pusherServer } from "@/lib/pusher";

interface SendMessageProps {
  content: string;
  receiverId: string;
  messageType: "text" | "image";
}

export async function sendMessageAction({
  content,
  messageType,
  receiverId,
}: SendMessageProps) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    return { success: false, message: "User not authorized" };
  }

  const senderId = user.id;

  const conversationId = `conversation:${[senderId, receiverId]
    .sort()
    .join(":")}`;

  const conversationExists = await redis.exists(conversationId);

  if (!conversationExists) {
    await redis.hset(conversationId, {
      participant1: senderId,
      participant2: receiverId,
    });
    await redis.sadd(`user:${senderId}:conversations`, conversationId);
    await redis.sadd(`user:${receiverId}:conversations`, conversationId);
  }
  //generate a unique id
  const messageId = `message:${uuidv4()}`;

  const timestamp = Date.now();
  //create a message
  await redis.hset(messageId, {
    senderId,
    content,
    timestamp,
    messageType,
  });

  await redis.zadd(`${conversationId}:messages`, {
    score: timestamp,
    member: JSON.stringify(messageId),
  });

  const channelName = `${senderId}__${receiverId}`
    .split("__")
    .sort()
    .join("__");

  await pusherServer?.trigger(channelName, "newMessage", {
    message: { senderId, content, timestamp, messageType },
  });

  return { success: true, conversationId, messageId };
}

export async function getMessages(
  selectedUserId: string,
  currentUserId: string
) {
  const conversationId = `conversation:${[selectedUserId, currentUserId]
    .sort()
    .join(":")}`;

  const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);
  if (messageIds.length === 0) return [];

  const pipeline = redis.pipeline();

  messageIds.forEach((messageId) => pipeline.hgetall(messageId as string));
  const messages = (await pipeline.exec()) as Message[];
  return messages;
}
