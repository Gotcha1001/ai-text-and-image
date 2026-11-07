// lib/paystack.ts
const PAYSTACK_BASE_URL = "https://api.paystack.co";

type InitializeTransactionParams = {
  email: string;
  amount: number; // smallest currency unit (cents / kobo)
  currency: string;
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
};

type InitializeTransactionResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export async function initializeTransaction(
  params: InitializeTransactionParams,
) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const json = (await res.json()) as InitializeTransactionResponse;

  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialize failed");
  }

  return json.data;
}
