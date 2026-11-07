// api/webhooks/paystack/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/database/db";

export const runtime = "nodejs";

type PaystackChargeData = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: {
    app?: string;
    userId?: string;
    credits?: string | number;
  } | null;
};

type PaystackEvent = {
  event: string;
  data: PaystackChargeData;
};

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body, required for signature check
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Paystack signs the raw body with HMAC SHA512 using your secret key
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET!)
    .update(body)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error("Webhook signature error");
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as PaystackEvent;

  if (event.event === "charge.success") {
    const data = event.data;
    const userId = data.metadata?.userId;
    const credits = Number(data.metadata?.credits ?? 0);

    if (
      data.metadata?.app === "nextgpt" &&
      data.status === "success" &&
      userId &&
      Number.isInteger(credits) &&
      credits > 0
    ) {
      try {
        await prisma.$transaction([
          // Unique paystackReference: a retried event fails here and rolls back
          prisma.creditPurchase.create({
            data: {
              paystackReference: data.reference,
              userId,
              credits,
              amountTotal: data.amount,
              currency: data.currency,
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
          reference: data.reference,
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          // Already processed this reference, so acknowledge and do nothing
          console.log("Duplicate webhook, already credited:", data.reference);
          return NextResponse.json({ received: true });
        }

        console.error("Failed to add credits:", err);
        // 500 makes Paystack retry later
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
