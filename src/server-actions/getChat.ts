"use server";
import { prisma } from "@/database/db";
import { getCurrentUser } from "./getCurrentUser";

export async function getChats() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
  }

  const chats = await prisma.chat.findMany({
    where: { userId: currentUser?.id },
    orderBy: {
      createdAt: "desc",
    },
  });

  return chats;
}
