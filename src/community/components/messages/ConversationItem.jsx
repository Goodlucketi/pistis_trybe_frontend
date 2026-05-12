import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";

const ConversationItem = ({ conversation, currentUser, isActive }) => {
  if (!conversation ||!currentUser) return null;

  const isGroup = conversation.type === "group";
  const otherUser =!isGroup
   ? conversation.participants?.find(p => p?.id!== currentUser.id)
    : null;

  const displayName = isGroup
   ? conversation.name || "Group Chat"
    : otherUser?.name || "Unknown User";

  const displayAvatar = isGroup
   ? conversation.avatar || "/default-group.png"
    : otherUser?.avatar || "/default-avatar.png";

  const isOnline =!isGroup && otherUser?.online;

  const { lastMessage, unreadCount = 0 } = conversation;
  const hasUnread = unreadCount > 0; // ← key variable

  const getTimeAgo = () => {
    if (!lastMessage?.timestamp) return "";
    try {
      return formatDistanceToNow(new Date(lastMessage.timestamp), {
        addSuffix: true
      });
    } catch {
      return "";
    }
  };

  const getPreviewText = () => {
    if (!lastMessage?.text) return "No messages yet";
    const prefix = lastMessage.senderId === currentUser.id? "You: " : "";
    return prefix + lastMessage.text;
  };

  return (
    <Link
      to={`/dashboard/messages/${conversation.id}`}
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
        isActive? "bg-purple-50 border-l-4 border-l-purple-600" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {isGroup? (
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-gray-600 rounded-full border-2 border-white flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </span>
        ) : isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className={`truncate ${hasUnread? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
            {displayName}
          </h3>
          <span className={`text-xs flex-shrink-0 ${hasUnread? "text-purple-600 font-semibold" : "text-gray-500"}`}>
            {getTimeAgo()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${hasUnread? "text-gray-900 font-bold" : "text-gray-500 font-normal"}`}>
            {getPreviewText()}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 bg-purple-600 text-white text-xs font-bold rounded-full min-w- h-5 px-1.5 flex items-center justify-center flex-shrink-0">
              {unreadCount > 99? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ConversationItem;
