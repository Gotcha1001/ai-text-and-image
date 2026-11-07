// server-actions/createCheckout.ts
"use server";

import { plans } from "@/constants/plans";
import { getCurrentUser } from "./getCurrentUser";
import { initializeTransaction } from "@/lib/paystack";

export async function createCheckout(planId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized");
  }

  const plan = plans.find((plan) => plan.id === planId);

  if (!plan) {
    throw new Error("Invalid plan.");
  }

  const transaction = await initializeTransaction({
    email: currentUser.email,
    amount: Math.round(plan.price * 100), // smallest currency unit
    currency: process.env.PAYSTACK_CURRENCY ?? "ZAR",
    reference: crypto.randomUUID(),
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat`,
    metadata: {
      app: "nextgpt",
      userId: currentUser.id,
      credits: plan.credits.toString(),
      planId: plan.id,
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    },
  });

  return transaction.authorization_url;
}
