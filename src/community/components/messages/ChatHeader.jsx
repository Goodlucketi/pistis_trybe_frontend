import { ArrowLeft, Search, X, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const ChatHeader = ({ 
  conversation, 
  currentUser, 
  onBack, 
  isMobile, 
  onSearch,
  onOpenGroupInfo
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // ← UPDATED: Real-time online status
  const getStatus = () => {
    if (conversation.isTyping) return "typing...";
    if (isGroup) return `${conversation.participants?.length || 0} members`;
    
    // Check online status first
    if (otherUser?.online) return "Active now";
    
    // Fall back to last seen
    if (otherUser?.lastSeen) {
      try {
        const date = new Date(otherUser.lastSeen);
        if (isNaN(date.getTime())) return "Offline";
        
        // If seen within last 5 minutes, still show "Active now"
        const diffMinutes = (Date.now() - date.getTime()) / 1000 / 60;
        if (diffMinutes < 5) return "Active now";
        
        return `Active ${formatDistanceToNow(date, { addSuffix: true })}`;
      } catch {
        return "Offline";
      }
    }
    return "Offline";
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleHeaderClick = () => {
    if (isGroup && onOpenGroupInfo) {
      onOpenGroupInfo();
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 sticky top-0 z-10">
      {isMobile && (
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div 
        className={`flex items-center gap-3 flex-1 min-w-0 ${isGroup? 'cursor-pointer' : ''}`}
        onClick={handleHeaderClick}
      >
        <div className="relative flex-shrink-0">
          <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
          {!isGroup && otherUser?.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {showSearch? (
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search in conversation..."
              className="w-full px-3 py-1 bg-gray-100 rounded-lg text-sm focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
              <p className={`text-xs truncate ${otherUser?.online? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {getStatus()}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isGroup && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGroupInfo?.();
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Group info"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (showSearch) {
              setSearchQuery("");
              onSearch?.("");
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {showSearch? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
