"use server";

import cloudinary from "@/lib/cloudinary";

function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG")
    return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (buf.toString("ascii", 0, 3) === "GIF") return "image/gif";
  return null;
}

// Cloudinary throws plain objects (not Error instances), so we describe the shape we care about
type CloudinaryError = {
  message?: string;
  http_code?: number;
};

function asCloudinaryError(err: unknown): CloudinaryError {
  if (typeof err === "object" && err !== null) {
    return err as CloudinaryError;
  }
  return {};
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MAX_WAIT_MS = 90_000; // total time to wait for ImageKit
const RETRY_DELAY_MS = 3_000; // pause between polls

async function fetchImageWithPolling(url: string, tag: string) {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < MAX_WAIT_MS) {
    attempt++;
    const t0 = Date.now();
    const response = await fetch(url, { cache: "no-store" });
    const contentType = response.headers.get("content-type");
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = sniffImageType(buffer);

    console.log(
      `${tag} attempt ${attempt} (${Date.now() - t0}ms): status=${response.status}, type=${contentType}, bytes=${buffer.length}, isImage=${!!type}`,
    );

    if (response.ok && type) {
      return { buffer, type };
    }

    const body = buffer.toString("utf8", 0, 300);
    const stillPreparing = /being prepared/i.test(body);

    if (!stillPreparing) {
      // A real failure (not just "wait a bit more")
      console.error(`${tag} ImageKit hard failure. Body:`, body);
      throw new Error(`ImageKit failed (${response.status}): ${body}`);
    }

    console.log(`${tag} still preparing, retrying in ${RETRY_DELAY_MS}ms...`);
    await sleep(RETRY_DELAY_MS);
  }

  throw new Error(`ImageKit image not ready after ${MAX_WAIT_MS / 1000}s`);
}

export async function generateImage(prompt: string) {
  const tag = `[generateImage ${Date.now()}]`;
  const trimmedContent = prompt.trim();
  if (!trimmedContent) throw new Error("Prompt is required");

  console.log(`${tag} prompt: "${trimmedContent}"`);

  // Built ONCE so every retry hits the same generation job
  const imageKitUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodeURIComponent(trimmedContent)}/nextgpt-${crypto.randomUUID()}.png`;
  console.log(`${tag} ImageKit URL: ${imageKitUrl}`);

  const { buffer, type } = await fetchImageWithPolling(imageKitUrl, tag);

  const dataUri = `data:${type};base64,${buffer.toString("base64")}`;
  console.log(
    `${tag} uploading to Cloudinary (${buffer.length} bytes, ${type})`,
  );

  try {
    const t1 = Date.now();
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "nextgpt-tutorial",
    });
    console.log(
      `${tag} Cloudinary OK in ${Date.now() - t1}ms: ${uploaded.secure_url}`,
    );
    return uploaded.secure_url;
  } catch (err: unknown) {
    const cloudinaryErr = asCloudinaryError(err);
    console.error(`${tag} Cloudinary upload failed:`, {
      message: cloudinaryErr.message,
      http_code: cloudinaryErr.http_code,
      raw: JSON.stringify(err, Object.getOwnPropertyNames(err ?? {})),
    });
    throw new Error(
      `Cloudinary upload failed: ${cloudinaryErr.message ?? "unknown error"}`,
    );
  }
}
