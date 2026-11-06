"use server";
import { prisma } from "@/database/db";
import { getCurrentUser } from "./getCurrentUser";

export async function deleteChat(chatId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.chat.delete({
    where: { id: chatId, userId: currentUser.id },
  });

  return { success: true };
}
