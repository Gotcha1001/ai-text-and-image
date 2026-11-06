"use server";
import { prisma } from "@/database/db";

export async function getMessages(chatId: string) {
  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
}
