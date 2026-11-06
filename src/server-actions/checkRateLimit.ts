"use server";
import { ratelimit } from "@/lib/rate-limit";
import { getCurrentUser } from "./getCurrentUser";

export async function checkRateLimit() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized.");
  }

  const { success } = await ratelimit.limit(`user:${currentUser.id}`);

  if (!success) {
    throw new Error("Too many requests. Please try again in a minute");
  }
}
