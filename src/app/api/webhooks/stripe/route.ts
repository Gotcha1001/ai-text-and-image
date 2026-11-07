import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/database/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body, required for signature check
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits ?? 0);

    if (
      session.metadata?.app === "nextgpt" &&
      session.payment_status === "paid" &&
      userId &&
      Number.isInteger(credits) &&
      credits > 0
    ) {
      try {
        await prisma.$transaction([
          // Unique stripeSessionId: a retried event fails here and rolls back
          prisma.creditPurchase.create({
            data: {
              stripeSessionId: session.id,
              userId,
              credits,
              amountTotal: session.amount_total,
              currency: session.currency,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
          }),
        ]);

        console.log("Credits added:", {
          userId,
          credits,
          sessionId: session.id,
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          // Already processed this session, so acknowledge and do nothing
          console.log("Duplicate webhook, already credited:", session.id);
          return NextResponse.json({ received: true });
        }

        console.error("Failed to add credits:", err);
        // 500 makes Stripe retry later
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
