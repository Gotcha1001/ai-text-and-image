// components/chat/DownloadChatButton.tsx
"use client";

import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import toast from "react-hot-toast";
import { useChatStore } from "@/store/useChatStore";

// jsPDF's built-in fonts only cover Latin-1, so normalise common symbols
// and replace anything else (e.g. emoji) so the text never renders garbled.
function toPdfText(input: string) {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, "?");
}

// Light markdown clean-up so the PDF doesn't show raw ** ## ``` etc.
function stripMarkdown(md: string) {
  return md
    .replace(/```[a-zA-Z0-9]*\n?/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^\s*[-*]\s+/gm, "- ");
}

// Fetch an image and re-encode it as JPEG so jsPDF can embed any format
async function loadImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Image fetch failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return {
      data: canvas.toDataURL("image/jpeg", 0.85),
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function DownloadChatButton() {
  const { selectedChat, messages } = useChatStore();
  const [loading, setLoading] = useState(false);

  if (!selectedChat || messages.length === 0) return null;

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Loaded on click so jsPDF isn't part of the initial page bundle
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxW = pageW - margin * 2;
      let y = margin;

      const ensureSpace = (h: number) => {
        if (y + h > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Only the AI output goes in the PDF (no prompts, no labels)
      const outputs = messages.filter(
        (message) => message.role === "ASSISTANT",
      );

      if (outputs.length === 0) {
        toast.error("Nothing to download yet.");
        return;
      }

      for (const message of outputs) {
        // Text content
        if (message.content) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 30);

          const lines: string[] = doc.splitTextToSize(
            toPdfText(stripMarkdown(message.content)),
            maxW,
          );
          const lineH = 5;

          for (const line of lines) {
            ensureSpace(lineH);
            doc.text(line, pageW / 2, y + 3.5, { align: "center" });
            y += lineH;
          }
          y += 2;
        }

        // Generated image
        if (message.imageURL) {
          try {
            const img = await loadImage(message.imageURL);
            const maxImgW = Math.min(maxW, 110);
            const maxImgH = 120;
            const ratio = img.width / img.height;

            let w = maxImgW;
            let h = w / ratio;
            if (h > maxImgH) {
              h = maxImgH;
              w = h * ratio;
            }

            ensureSpace(h + 2);
            doc.addImage(img.data, "JPEG", (pageW - w) / 2, y, w, h);
            y += h + 2;
          } catch {
            ensureSpace(6);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("[Image could not be included]", pageW / 2, y + 3.5, {
              align: "center",
            });
            y += 6;
          }
        }

        y += 4;
        if (message !== outputs[outputs.length - 1]) {
          ensureSpace(8);
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, y, pageW - margin, y);
          y += 6;
        }
      }

      // Page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${i} / ${pageCount}`, pageW / 2, pageH - 8, {
          align: "center",
        });
      }

      const safeName =
        selectedChat.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") ||
        "conversation";
      doc.save(`${safeName.slice(0, 60)}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Could not generate the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download conversation as PDF"
      className="fixed right-4 top-4 z-40 flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:bg-card/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LuDownload className="h-4 w-4" />
      <span className="hidden sm:inline">
        {loading ? "Preparing..." : "Download PDF"}
      </span>
    </button>
  );
}
