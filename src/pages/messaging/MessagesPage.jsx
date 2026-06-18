import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConversationList from "../../community/components/messages/ConversationList";
import ChatWindow from "../../community/components/messages/ChatWindow";
import EmptyChatState from "../../community/components/messages/EmptyChatState";
import { getChats, getMessages, sendMessage, deleteMessage, reactToMessage, createGroupChat } from "../../services/ChatService";
import { getMe } from "../../services/UserService";
import { useSocket } from "../../hooks/useSocket";
import { toast } from "react-toastify"

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [localMessages, setLocalMessages] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const { joinConversation, leaveConversation, sendMessage: socketSend, on } = useSocket();

  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const { data: conversations = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
    refetchInterval: 30000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 0,
  });

  const normalizeMessage = useCallback((msg) => {
    if (!msg) return null;
    return {
      id: msg._id || msg.id,
      senderId: msg.senderId?._id || msg.senderId,
      senderName: msg.senderId?.fullName || "",
      senderAvatar: msg.senderId?.avatarUrl || null,
      text: msg.body || "",
      attachments: msg.mediaUrl ? [{ id: msg._id, url: msg.mediaUrl, type: "image/jpeg", name: "attachment" }] : [],
      timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      status: msg.isRead ? "read" : "sent",
      reactions: msg.reactions || {},
      replyTo: msg.replyTo || null,
    };
  }, []);

  // Sync fetched messages to local state
  useEffect(() => {
    if (!messagesData?.messages || !conversationId) return;
    setLocalMessages((prev) => {
      const fetched = messagesData.messages.map(normalizeMessage).filter(Boolean);
      const existing = prev[conversationId] || [];
      const fetchedIds = new Set(fetched.map((m) => m.id));
      const localOnly = existing.filter((m) => m?._optimistic && !fetchedIds.has(m?.id));
      return { ...prev, [conversationId]: [...fetched, ...localOnly] };
    });
  }, [messagesData, conversationId, normalizeMessage]);

  // Join / leave conversation room
  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation, queryClient]);

  // Receive messages via socket
  useEffect(() => {
    const off = on("receive_message", (message) => {
      const chatId = message.chatId?.toString() || conversationId;
      const senderId = message.senderId?._id || message.senderId;
      if (senderId === currentUser?._id) {
        // Replace our optimistic message with the real one
        const normalized = normalizeMessage(message);
        if (!normalized) return;
        setLocalMessages((prev) => {
          const msgs = prev[chatId] || [];
          const optimisticIdx = msgs.findIndex((m) => m?._optimistic);
          if (optimisticIdx !== -1) {
            const updated = [...msgs];
            updated[optimisticIdx] = normalized;
            return { ...prev, [chatId]: updated };
          }
          return prev;
        });
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        return;
      }
      const normalized = normalizeMessage(message);
      if (!normalized) return;
      setLocalMessages((prev) => {
        const existing = prev[chatId] || [];
        if (existing.some((m) => m?.id === normalized.id)) return prev;
        return { ...prev, [chatId]: [...existing, normalized] };
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });
    return off;
  }, [on, conversationId, queryClient, currentUser?._id, normalizeMessage]);

  useEffect(() => {
    const off = on("new_message_notification", ({ conversationId: chatId, message }) => {
      const senderId = message.senderId?._id || message.senderId;
      if (senderId === currentUser?._id) return;
      const normalized = normalizeMessage(message);
      if (!normalized) return;
      setLocalMessages((prev) => {
        const existing = prev[chatId] || [];
        if (existing.some((m) => m?.id === normalized.id)) return prev;
        return { ...prev, [chatId]: [...existing, normalized] };
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });
    return off;
  }, [on, currentUser?._id, queryClient, normalizeMessage]);

  useEffect(() => {
    const off = on("message_deleted", ({ messageId }) => {
      setLocalMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((m) => m?.id !== messageId),
      }));
    });
    return off;
  }, [on, conversationId]);

  useEffect(() => {
    const offOnline = on("user:online", ({ userId }) => {
      setOnlineUserIds((prev) => new Set([...prev, userId]));
    });
    const offOffline = on("user:offline", ({ userId }) => {
      setOnlineUserIds((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    });
    return () => { offOnline(); offOffline(); };
  }, [on]);

  useEffect(() => {
    const off = on("message_reaction_updated", ({ messageId, reactions }) => {
      setLocalMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m?.id === messageId ? { ...m, reactions } : m
        ),
      }));
    });
    return off;
  }, [on, conversationId]);

  const normalizeConversation = (conv) => {
    if (!conv) return null;
    const other = conv.participants?.find((p) => p?._id !== currentUser?._id);
    return {
      id: conv._id,
      type: conv.type || "direct",
      name: conv.type === "group" ? conv.name : other?.fullName || "Unknown",
      avatar: conv.type === "group" ? conv.coverUrl : other?.avatarUrl,
      participants: (conv.participants || []).map((p) => ({ id: p?._id, name: p?.fullName || p?.email || "Unknown", avatar: p?.avatarUrl, role: "member" })).filter((p) => p.id),
      lastMessage: conv.lastMessage?.timestamp ? { text: conv.lastMessage.text || "", timestamp: conv.lastMessage.timestamp, senderId: conv.lastMessage.senderId } : null,
      unreadCount: conv.unreadCount || 0,
      createdAt: conv.createdAt,
    };
  };

  const normalizedConversations = currentUser ? conversations.map(normalizeConversation).filter(Boolean) : [];
  const activeConversation = normalizedConversations.find((c) => c?.id === conversationId);
  const activeMessages = (localMessages[conversationId] || (messagesData?.messages || []).map(normalizeMessage)).filter((m) => m && m.timestamp);
  const contacts = normalizedConversations.flatMap((c) => c?.participants || []).filter((p, i, self) => p?.id && p.id !== currentUser?._id && self.findIndex((u) => u?.id === p.id) === i);
  const normalizedCurrentUser = currentUser ? { id: currentUser._id, name: currentUser.fullName || currentUser.email, avatar: currentUser.avatarUrl } : null;

  // FIX: Route through socket for text messages to avoid duplicate saves
  // HTTP only used for file uploads (which socket doesn't handle binary)
  const handleSendMessage = useCallback(({ text, attachments = [], replyTo = null }) => {
    if (!conversationId) return;
    const hasFile = attachments?.length > 0;

    // Optimistic message
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      senderId: currentUser?._id,
      senderName: currentUser?.fullName,
      senderAvatar: currentUser?.avatarUrl,
      text: text || "",
      attachments: [],
      timestamp: new Date().toISOString(),
      status: "sent",
      reactions: {},
      replyTo: replyTo || null,
      _optimistic: true,
    };
    setLocalMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), optimistic] }));

    if (hasFile) {
      // Use HTTP for file uploads — socket can't handle binary
      sendMessage(conversationId, { body: text, replyTo, file: attachments[0]?.file })
        .then((msg) => {
          const normalized = normalizeMessage(msg);
          setLocalMessages((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((m) => (m?.id === optimistic.id ? normalized : m)),
          }));
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        })
        .catch(() => {
          setLocalMessages((prev) => ({ ...prev, [conversationId]: (prev[conversationId] || []).filter((m) => m?.id !== optimistic.id) }));
          toast.error("Failed to send file");
        });
    } else {
      // Text messages go through socket — socket handler saves to DB and broadcasts
      socketSend({ conversationId, body: text || "", replyTo });
    }
  }, [conversationId, currentUser, socketSend, normalizeMessage, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (messageId) => deleteMessage(conversationId, messageId),
    onSuccess: (_, messageId) => {
      setLocalMessages((prev) => ({ ...prev, [conversationId]: (prev[conversationId] || []).filter((m) => m?.id !== messageId) }));
    },
    onError: () => toast.error("Failed to delete message"),
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }) => reactToMessage(conversationId, messageId, emoji),
    onError: () => toast.error("Failed to react"),
  });

  const createGroupMutation = useMutation({
    mutationFn: ({ name, participantIds }) => createGroupChat({ name, participantIds }),
    onSuccess: (newChat) => { queryClient.invalidateQueries({ queryKey: ["chats"] }); navigate(`/dashboard/messages/${newChat._id}`); },
    onError: () => toast.error("Failed to create group chat"),
  });

  const handleStartDirectChat = async (user) => {
    try {
      const { startDirectChat } = await import("../../services/ChatService");
      const response = await startDirectChat(user._id || user.id);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate(`/dashboard/messages/${response._id}`);
    } catch { toast.error("Could not start chat"); }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!normalizedCurrentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sharedProps = {
    conversations: normalizedConversations,
    currentUser: normalizedCurrentUser,
    activeId: conversationId,
    onSelectConversation: (conv) => navigate(`/dashboard/messages/${conv.id}`),
    contacts,
    onCreateGroup: ({ name, participantIds }) => createGroupMutation.mutate({ name, participantIds }),
    onStartDirectChat: handleStartDirectChat,
    isLoading: chatsLoading,
    onlineUserIds,
  };

  const chatWindowProps = activeConversation ? {
    conversation: activeConversation,
    messages: activeMessages,
    currentUser: normalizedCurrentUser,
    onSendMessage: handleSendMessage,
    onReact: (messageId, emoji) => reactMutation.mutate({ messageId, emoji }),
    onForward: (message, targetId) => handleSendMessage({ text: message?.text || "", replyTo: null }),
    onBack: () => navigate("/dashboard/messages"),
    isMobile,
    onDelete: (messageId) => deleteMutation.mutate(messageId),
    allConversations: normalizedConversations,
    setConversations: () => {},
    contacts,
    onCreateGroup: ({ name, participantIds }) => createGroupMutation.mutate({ name, participantIds }),
  } : null;

  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
        {conversationId && activeConversation && chatWindowProps ? (
          <ChatWindow key={activeConversation.id} {...chatWindowProps} />
        ) : (
          <ConversationList {...sharedProps} />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] p-2 overflow-hidden">
      <ConversationList {...sharedProps} />
      {activeConversation && chatWindowProps ? <ChatWindow key={activeConversation.id} {...chatWindowProps} /> : <EmptyChatState />}
    </div>
  );
};

export default MessagesPage;
