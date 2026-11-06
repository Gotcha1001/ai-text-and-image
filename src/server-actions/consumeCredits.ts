"use server";
import { prisma } from "@/database/db";
import { getCurrentUser } from "./getCurrentUser";

export async function consumeCredits(amount: number) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized.");
  }

  if (currentUser.credits < amount) {
    throw new Error(
      "You don't have enough credits. Please purchase more credits",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      credits: {
        decrement: amount,
      },
    },
    select: {
      credits: true,
    },
  });

  return updatedUser.credits;
}
