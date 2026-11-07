"use client";
import { useChatStore } from "@/store/useChatStore";
import Logo from "../sidebar/Logo";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TypingIndicator from "../loading/TypingIndicator";
import { FaArrowUp } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createChat } from "@/server-actions/createChat";
import { createMessage } from "@/server-actions/createMessage";
import { getMessages } from "@/server-actions/getMessages";
import { generateText } from "@/server-actions/generateText";
import MarkdownRenderer from "./MarkdownRenderer";
import { generateImage } from "@/server-actions/generateImage";
import ImageGeneratingIndicator from "../loading/ImageGeneratingIndicator";
import { consumeCredits } from "@/server-actions/consumeCredits";
import { checkRateLimit } from "@/server-actions/checkRateLimit";
import DownloadChatButton from "./DownloadChatButton";

export default function ChatBox() {
  const {
    selectedChat,
    mode,
    setMode,
    addChat,
    setSelectedChat,
    setMessages,
    addMessage,
    messages,
  } = useChatStore();

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [loadingType, setLoadingType] = useState<"TEXT" | "IMAGE" | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;

      try {
        setLoadingMessages(true);

        const data = await getMessages(selectedChat.id);
        setMessages(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedChat, setMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setLoadingType("TEXT");

    try {
      // Check for rate limit
      await checkRateLimit();

      // Check or consume credits
      await consumeCredits(mode === "IMAGE" ? 3 : 1);

      let chat = selectedChat;

      if (!chat) {
        // Create Chat

        chat = await createChat();

        if (!chat) return;

        addChat(chat);
        setSelectedChat(chat);
      }

      const currentPrompt = prompt;

      setPrompt("");

      // Create the message
      const userMessage = await createMessage({
        chatId: chat.id,
        role: "USER",
        content: currentPrompt,
      });

      addMessage(userMessage);

      if (mode === "IMAGE") {
        setLoadingType("IMAGE");

        const imageURL = await generateImage(currentPrompt);

        const assistantMessage = await createMessage({
          chatId: chat.id,
          role: "ASSISTANT",
          imageURL,
        });

        addMessage(assistantMessage);

        return;
      }

      // Send the prompt to the AI
      const history = messages.slice(-20).map((message) => ({
        role: message.role,
        content:
          message.content ?? "[Generated an image from the previous prompt]",
      }));

      const aiResponse = await generateText({
        prompt: currentPrompt,
        history,
      });

      const assistantMessage = await createMessage({
        chatId: chat.id,
        role: "ASSISTANT",
        content: aiResponse,
      });
      addMessage(assistantMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoadingType(null);
      router.refresh();
    }
  };

  return (
    <>
      <DownloadChatButton />
      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        {!selectedChat ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Logo />
            <h2 className="mt-6 text-2xl font-bold md:text-4xl text-white/90">
              Welcome to NextGPT
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted md:text-base">
              Generate text and images with AI
            </p>
          </div>
        ) : (
          <>
            {!loadingMessages && messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Logo />
                <h2 className="mt-6 text-2xl font-bold md:text-4xl text-white/90">
                  Start the conversation
                </h2>
                <p className="mt-3 max-w-md text-sm text-muted md:text-base">
                  Type a prompt to start chatting
                </p>
              </div>
            ) : (
              <div className="mx-auto flex flex-col gap-4 md:gap-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${message.role === "USER" ? "bg-primary" : "border border-border bg-card"}`}
                    >
                      {message.content && (
                        <>
                          {message.role === "USER" ? (
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <MarkdownRenderer>
                              {message.content}
                            </MarkdownRenderer>
                          )}
                        </>
                      )}

                      {message.imageURL && (
                        <Image
                          src={message.imageURL}
                          alt="Image"
                          width={1024}
                          height={1024}
                          className="mt-3 w-full rounded-2xl border border-white/10 object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))}
                {(loadingType === "TEXT" || loadingMessages) && (
                  <TypingIndicator />
                )}
                {loadingType === "IMAGE" && <ImageGeneratingIndicator />}
              </div>
            )}
          </>
        )}
        <div ref={messageEndRef} />
      </div>
      {/* Input */}
      <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-border bg-card/40 p-1 backdrop-blur-sm">
        <button
          onClick={() => setMode("TEXT")}
          className={`rounded-full px-4 py-2 text-sm transition-all cursor-pointer ${mode === "TEXT" ? "bg-primary shadow-sm" : "bg-transparent hover:bg-white/5"}`}
        >
          TEXT
        </button>
        <button
          onClick={() => setMode("IMAGE")}
          className={`rounded-full px-4 py-2 text-sm transition-all cursor-pointer ${mode === "IMAGE" ? "bg-primary shadow-sm" : "bg-transparent hover:bg-white/5"}`}
        >
          IMAGE
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
        <div className="flex items-end gap-2 rounded-full border border-border bg-card p-2 md:gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={1}
            placeholder={
              mode === "TEXT"
                ? "Ask NextGPT anything..."
                : "Describe the image you want to generate..."
            }
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button className="rounded-full bg-primary p-3 text-sm font-medium transition hover:opacity-90 cursor-pointer">
            <FaArrowUp />
          </button>
        </div>
      </form>
    </>
  );
}
