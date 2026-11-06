"use server";
import { prisma } from "@/database/db";

interface CreateMessageProps {
  chatId: string;
  role: "USER" | "ASSISTANT";
  content?: string;
  imageURL?: string;
}

export async function createMessage({
  chatId,
  role,
  content,
  imageURL,
}: CreateMessageProps) {
  const trimmedContent = content?.trim();

  const messageCount = await prisma.message.count({
    where: { chatId },
  });

  const message = await prisma.message.create({
    data: {
      chatId,
      role,
      content: trimmedContent,
      imageURL,
    },
  });

  // Update the chat
  const updateData: { updatedAt: Date; title?: string } = {
    updatedAt: new Date(),
  };

  if (messageCount === 0 && role === "USER" && trimmedContent) {
    updateData.title =
      trimmedContent.length > 40
        ? `${trimmedContent.slice(0, 40)}...`
        : trimmedContent;
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: updateData,
  });

  return message;
}
