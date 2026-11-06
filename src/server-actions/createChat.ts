"use server";

import { prisma } from "@/database/db";
import { getCurrentUser } from "./getCurrentUser";

export async function createChat() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized");
  }

  const chat = await prisma.chat.create({
    data: {
      title: "New Chat",
      userId: currentUser?.id,
    },
  });
  return chat;
}
