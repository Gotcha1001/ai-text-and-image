"use client";

import { useChatStore } from "@/store/useChatStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { FiLogOut, FiPlus, FiSearch, FiSidebar, FiX } from "react-icons/fi";
import Logo from "./Logo";
import { useEffect, useState } from "react";

import ChatItem from "../chat/ChatItem";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiCoinsLine } from "react-icons/ri";
import { authClient } from "@/lib/auth-client";
import { getChats } from "@/server-actions/getChat";

interface SidebarProps {
  username: string;
  initialCredits: number;
}

export default function Sidebar({ username, initialCredits }: SidebarProps) {
  const { openMobile, closeMobile, isExpanded, isMobileOpen, toggleExpanded } =
    useSidebarStore();

  const { selectedChat, setSelectedChat, setChats, chats, setMessages } =
    useChatStore();
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);

  const filterChats = chats.filter((chat) =>
    chat.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    setSelectedChat(null);
    setMessages([]);
    router.refresh();
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  useEffect(() => {
    const loadChats = async () => {
      const chats = await getChats();

      setChats(chats);
      setLoadingChats(false);
    };

    loadChats();
  }, [setChats]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={openMobile}
        className="fixed left-4 top-4 z-50 rounded-lg bg-card p-2 md:hidden"
      >
        <FiSidebar size={20} className="text-white" />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-linear-to-b from-[#242124]/30 to-[#000000]/30 backdrop-blur-3xl transition-all duration-300 ${isExpanded ? "md:w-72" : "md:w-20"} ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center p-5 ${isExpanded ? "justify-between" : "flex-col gap-4"}`}
        >
          {isExpanded ? (
            <Logo />
          ) : (
            <div className="mx-auto">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-violet-600 to-blue-500 font-bold text-white">
                N
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                closeMobile();
              } else {
                toggleExpanded();
              }
            }}
            className="rounded-lg p-2 hover:bg-card"
          >
            {isMobileOpen ? (
              <FiX size={20} className="text-white" />
            ) : (
              <FiSidebar size={20} className="text-white" />
            )}
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3">
          <button
            onClick={handleNewChat}
            className={`flex w-full cursor-pointer items-center rounded-xl bg-primary px-4 py-3 text-white transition hover:opacity-90 ${!isExpanded && "justify-center"}`}
          >
            <FiPlus size={18} />
            {isExpanded && (
              <span className="ml-2 text-sm font-medium">New Chat</span>
            )}
          </button>
        </div>
        {/* Search */}
        {isExpanded && (
          <div className="px-3 mt-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2  text-white" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 outline-none focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Chats */}
        <div className="mt-6 flex-1 overflow-y-auto px-3 no-scrollbar">
          {isExpanded && <h2 className="px-6 font-bold my-1">Recent</h2>}
          {loadingChats && (
            <div className="py-3 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 animate-pulse rounded-xl bg-card"
                />
              ))}
            </div>
          )}
          {!loadingChats && chats && (
            <div className="space-y-1">
              {filterChats.map((chat) => (
                <ChatItem
                  chat={chat}
                  key={chat.id}
                  isExpanded={isExpanded}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => {
                    router.replace("chat");
                    closeMobile();
                    setSelectedChat(chat);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Credits */}
        <Link href="/pricing" className="px-3 pb-3">
          {isExpanded ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <RiCoinsLine size={18} className="text-yellow-500" />
                <span className="text-sm font-medium">Credits</span>
              </div>
              <p className="mt-3 text-2xl font-bold">{initialCredits}</p>
              <p className="text-muted text-xs">Remaining Credits</p>
            </div>
          ) : (
            <button className="flex h-12 w-full items-center justify-center rounded-xl bg-card">
              <RiCoinsLine size={20} className="text-yellow-500" />
            </button>
          )}
        </Link>

        {/* User */}
        <div className="border-t border-border p-3">
          <button
            className={`flex w-full items-center rounded-xl p-2 hover:bg-card ${!isExpanded && "justify-center"}`}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-600 font-semibold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            {isExpanded && (
              <div className="ml-3 text-left">
                <p className="text-md font-medium">{username}</p>
              </div>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center rounded-xl p-3 text-teal-500 cursor-pointer transition hover:bg-card ${!isExpanded && "justify-center"}`}
          >
            <FiLogOut size={18} />

            {isExpanded && (
              <span className="ml-3 font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
