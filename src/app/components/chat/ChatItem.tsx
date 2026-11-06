import { deleteChat } from "@/server-actions/deleteChat";
import { Chat, useChatStore } from "@/store/useChatStore";
import { FiTrash2 } from "react-icons/fi";

interface ChatItemProps {
  chat: Chat;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function ChatItem({
  chat,
  isExpanded,
  isSelected,
  onClick,
}: ChatItemProps) {
  const { removeChat, selectedChat, setSelectedChat } = useChatStore();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const confirmed = window.confirm("Delete this chat?");

    if (!confirmed) return;

    await deleteChat(chat.id);

    removeChat(chat.id);

    if (selectedChat?.id === chat.id) {
      setSelectedChat(null);
    }
  };

  return (
    <div
      className={`group flex w-full items-center justify-between rounded-xl px-3 transition py-3 ${isSelected ? "bg-card" : "hover:bg-card/60"}`}
    >
      <button
        onClick={onClick}
        className="flex flex-1 items-center min-w-0 cursor-pointer"
      >
        {isExpanded && <span className="truncate text-sm">{chat.title}</span>}
      </button>
      {isExpanded && (
        <button
          onClick={handleDelete}
          className="rounded-lg p-1 opacity-0 transition hover:bg-background group-hover:opacity-100 cursor-pointer"
        >
          <FiTrash2 className="text-muted" size={14} />
        </button>
      )}
    </div>
  );
}
