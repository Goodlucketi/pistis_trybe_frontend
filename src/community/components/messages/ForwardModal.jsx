import { X } from "lucide-react";

const ForwardModal = ({ message, conversations = [], onConfirm, onClose }) => {
  // ← GUARD: filter out null conversations and handle missing message
  const safeConversations = (conversations || []).filter(c => c && c.id);

  if (!message) return null; // ← don't render if no message

  const getConversationName = (conv) => {
    if (!conv) return "Unknown";
    if (conv.type === "group") return conv.name || "Group Chat";

    const otherParticipant = conv.participants?.find(p => p?.id!== 1);
    return otherParticipant?.name || "Unknown User";
  };

  const getConversationAvatar = (conv) => {
    if (!conv) return "/default-avatar.png";
    if (conv.type === "group") return conv.avatar || "/default-group.png";

    const otherParticipant = conv.participants?.find(p => p?.id!== 1);
    return otherParticipant?.avatar || "/default-avatar.png";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md max-h- flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Forward message</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 truncate">
            {message.text || "Attachment"} {/* ← fallback if text is null */}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {safeConversations.length === 0? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No conversations to forward to
            </div>
          ) : (
            safeConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onConfirm(conv.id)}
                className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b"
              >
                <img
                  src={getConversationAvatar(conv)}
                  alt={getConversationName(conv)}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium truncate">{getConversationName(conv)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
