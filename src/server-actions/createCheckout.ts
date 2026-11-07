"use server";
import { plans } from "@/constants/plans";
import { getCurrentUser } from "./getCurrentUser";
import { stripe } from "@/lib/stripe";

export async function createCheckout(planId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    throw new Error("Unauthorized");
  }

  const plan = plans.find((plan) => plan.id === planId);

  if (!plan) {
    throw new Error("Invalid plan.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    metadata: {
      app: "nextgpt",
      userId: currentUser.id,
      credits: plan.credits.toString(),
    },

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",

          product_data: {
            name: `${plan.name} Credits`,
            description: `${plan.credits} credits included`,
          },
          unit_amount: Math.round(plan.price * 100),
        },
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return session.url;
}
