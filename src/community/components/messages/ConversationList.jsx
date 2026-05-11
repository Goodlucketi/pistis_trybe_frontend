import { useState, useMemo } from "react";
import { Search, Plus, MessageCircle } from "lucide-react";
import ConversationItem from "./ConversationItem";
import CreateGroupModal from "./CreateGroupModal";
import NewChatModal from "./NewChatModal";

const ConversationList = ({
  conversations,
  currentUser,
  activeId,
  onSelectConversation,
  contacts,
  onCreateGroup,
  onStartDirectChat,
  isLoading = false,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (activeFilter === "unread") {
      filtered = filtered.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === "groups") {
      filtered = filtered.filter((c) => c.type === "group");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const name =
          c.type === "group"
            ? c.name
            : c.participants.find((p) => p.id !== currentUser.id)?.name;
        return (
          name?.toLowerCase().includes(query) ||
          c.lastMessage?.text?.toLowerCase().includes(query)
        );
      });
    }

    return filtered.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.timestamp || a.createdAt || 0);
      const bTime = new Date(b.lastMessage?.timestamp || b.createdAt || 0);
      return bTime - aTime;
    });
  }, [conversations, activeFilter, searchQuery, currentUser.id]);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: unreadTotal },
    { key: "groups", label: "Groups" },
  ];

  return (
    <div className="w-full lg:w-80 lg:border-r lg:border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 my-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="New Direct Message"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              title="New Group"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-1.5 ${activeFilter === filter.key ? "text-white" : "text-gray-500"}`}>
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
            <p>No conversations yet</p>
            <p className="text-xs text-gray-300">Start a chat or create a group</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUser={currentUser}
              isActive={conv.id === activeId}
              onClick={() => onSelectConversation?.(conv)}
            />
          ))
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          contacts={contacts}
          currentUser={currentUser}
          onCreateGroup={(newGroup) => {
            onCreateGroup(newGroup);
            setShowCreateGroup(false);
          }}
        />
      )}

      {showNewChat && (
        <NewChatModal
          isOpen={showNewChat}
          onClose={() => setShowNewChat(false)}
          currentUserId={currentUser?.id}
          onStartChat={(user) => onStartDirectChat?.(user)}
        />
      )}
    </div>
  );
};

export default ConversationList;