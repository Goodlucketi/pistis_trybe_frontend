import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConversationList from "../../community/components/messages/ConversationList";
import ChatWindow from "../../community/components/messages/ChatWindow";
import EmptyChatState from "../../community/components/messages/EmptyChatState";
import { getChats, getMessages, sendMessage, deleteMessage, reactToMessage, createGroupChat } from "../../services/ChatService";
import { getMe } from "../../services/UserService";
import { useSocket } from "../../hooks/useSocket";
import getErrorMessage from "../../hooks/useErrorToast";

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [localMessages, setLocalMessages] = useState({});
  const { joinConversation, leaveConversation, on } = useSocket();

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: conversations = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 30000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled:!!conversationId,
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
      attachments: msg.mediaUrl? [{ id: msg._id, url: msg.mediaUrl, type: "image/jpeg", name: "attachment" }] : [],
      timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      status: msg.isRead? "read" : "sent",
      reactions: msg.reactions || {},
      replyTo: msg.replyTo || null,
      forwardedFrom: msg.forwardedFrom || null,
    };
  }, []);

  useEffect(() => {
    if (!messagesData?.messages ||!conversationId) return;
    setLocalMessages((prev) => {
      const fetched = messagesData.messages.map(normalizeMessage).filter(Boolean);
      const existing = prev[conversationId] || [];
      const fetchedIds = new Set(fetched.map((m) => m.id));
      const localOnly = existing.filter((m) =>!fetchedIds.has(m?.id));
      return {
       ...prev,
        [conversationId]: [...fetched,...localOnly],
      };
    });
  }, [messagesData, conversationId, normalizeMessage]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation, queryClient]);

  useEffect(() => {
    const off = on("receive_message", (message) => {
      const chatId = message.chatId?.toString() || conversationId;
      const senderId = message.senderId?._id || message.senderId;

      if (senderId === currentUser?._id) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        return;
      }

      const normalized = normalizeMessage(message);
      if (!normalized) return;

      setLocalMessages((prev) => {
        const existing = prev[chatId] || [];
        const alreadyExists = existing.some((m) => m?.id === normalized.id);
        if (alreadyExists) return prev;
        return {
         ...prev,
          [chatId]: [...existing, normalized],
        };
      });

      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
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
        const alreadyExists = existing.some((m) => m?.id === normalized.id);
        if (alreadyExists) return prev;
        return {
         ...prev,
          [chatId]: [...existing, normalized],
        };
      });

      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });
    return off;
  }, [on, currentUser?._id, queryClient, normalizeMessage]);

  useEffect(() => {
    const off = on("message_deleted", ({ messageId }) => {
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: (prev[conversationId] || []).filter((m) => m?.id!== messageId),
      }));
    });
    return off;
  }, [on, conversationId]);

  useEffect(() => {
    const off = on("message_reaction_updated", ({ messageId, reactions }) => {
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m?.id === messageId? {...m, reactions } : m
        ),
      }));
    });
    return off;
  }, [on, conversationId]);

  const normalizeConversation = (conv) => {
    if (!conv) return null;
    const otherParticipant = conv.participants?.find((p) => p?._id!== currentUser?._id);
    return {
      id: conv._id,
      type: conv.type || "direct",
      name: conv.type === "group"? conv.name : otherParticipant?.fullName || "Unknown",
      avatar: conv.type === "group"? conv.coverUrl : otherParticipant?.avatarUrl,
      participants: (conv.participants || []).map((p) => ({
        id: p?._id,
        name: p?.fullName || p?.email || "Unknown",
        avatar: p?.avatarUrl,
        role: "member",
      })).filter(p => p.id),
      lastMessage: conv.lastMessage && conv.lastMessage.timestamp
       ? {
            text: conv.lastMessage.text || "",
            timestamp: conv.lastMessage.timestamp,
            senderId: conv.lastMessage.senderId,
          }
        : null,
      unreadCount: conv.unreadCount || 0,
      createdAt: conv.createdAt,
    };
  };

  const normalizedConversations = currentUser
   ? conversations.map(normalizeConversation).filter(Boolean)
    : [];

  const activeConversation = normalizedConversations.find((c) => c?.id === conversationId);

  const activeMessages = (localMessages[conversationId]
   ? localMessages[conversationId]
    : (messagesData?.messages || []).map(normalizeMessage)
  ).filter(m => m && m.timestamp);

  const contacts = normalizedConversations
   .flatMap((c) => c?.participants || [])
   .filter(
      (p, index, self) =>
        p?.id && p.id!== currentUser?._id &&
        self.findIndex((u) => u?.id === p.id) === index
    );

  const normalizedCurrentUser = currentUser
   ? {
        id: currentUser._id,
        name: currentUser.fullName || currentUser.email,
        avatar: currentUser.avatarUrl,
      }
    : null;

  const sendMutation = useMutation({
    mutationFn: ({ chatId, body, replyTo, file }) =>
      sendMessage(chatId, { body, replyTo, file }),
    onMutate: ({ body, replyTo }) => {
      const optimisticMsg = {
        id: `optimistic-${Date.now()}`,
        senderId: currentUser?._id,
        senderName: currentUser?.fullName,
        senderAvatar: currentUser?.avatarUrl,
        text: body || "",
        attachments: [],
        timestamp: new Date().toISOString(),
        status: "sent",
        reactions: {},
        replyTo: replyTo || null,
        forwardedFrom: null,
        _optimistic: true,
      };
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: [...(prev[conversationId] || []), optimisticMsg],
      }));
      return { optimisticMsg };
    },
    onSuccess: (newMsg, _, context) => {
      const normalized = normalizeMessage(newMsg);
      if (!normalized) return;
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m?.id === context?.optimisticMsg?.id? normalized : m
        ),
      }));
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error, _, context) => {
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: (prev[conversationId] || []).filter(
          (m) => m?.id!== context?.optimisticMsg?.id
        ),
      }));
      alert(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId) => deleteMessage(conversationId, messageId),
    onSuccess: (_, messageId) => {
      setLocalMessages((prev) => ({
       ...prev,
        [conversationId]: (prev[conversationId] || []).filter((m) => m?.id!== messageId),
      }));
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }) =>
      reactToMessage(conversationId, messageId, emoji),
    onError: (error) => alert(getErrorMessage(error)),
  });

  const createGroupMutation = useMutation({
    mutationFn: ({ name, participantIds }) =>
      createGroupChat({ name, participantIds }),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/dashboard/messages/${newChat._id}`);
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  const handleSendMessage = ({ text, attachments = [], replyTo = null }) => {
    if (!conversationId) return;
    const file = attachments?.[0] || null;
    sendMutation.mutate({ chatId: conversationId, body: text, replyTo, file });
  };

  const handleReact = (messageId, emoji) => {
    reactMutation.mutate({ messageId, emoji });
  };

  const handleDelete = (messageId) => {
    deleteMutation.mutate(messageId);
  };

  const handleForward = (message, targetConvId) => {
    sendMutation.mutate({
      chatId: targetConvId,
      body: message?.text || "",
      replyTo: null,
      file: null,
    });
  };

  const handleStartDirectChat = async (user) => {
    try {
      const response = await import("../../services/ChatService").then(m =>
        m.startDirectChat(user._id)
      );
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/dashboard/messages/${response._id}`);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleCreateGroup = ({ name, participantIds }) => {
    createGroupMutation.mutate({ name, participantIds });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goBack = () => navigate("/dashboard/messages");

  if (!normalizedCurrentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── MOBILE VIEW - FIXED ──
  if (isMobile) {
    return (
      <div className="h- w-full flex flex-col overflow-hidden">
        {conversationId && activeConversation? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            currentUser={normalizedCurrentUser}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            onForward={handleForward}
            onBack={goBack}
            isMobile={isMobile}
            onDelete={handleDelete}
            allConversations={normalizedConversations}
            setConversations={() => {}}
            contacts={contacts}
            onCreateGroup={handleCreateGroup}
          />
        ) : (
          <ConversationList
            conversations={normalizedConversations}
            currentUser={normalizedCurrentUser}
            activeId={conversationId}
            onSelectConversation={(conv) => navigate(`/dashboard/messages/${conv.id}`)}
            contacts={contacts}
            onCreateGroup={handleCreateGroup}
            onStartDirectChat={handleStartDirectChat}
            isLoading={chatsLoading}
          />
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW ──
  return (
    <div className="flex h- p-2 overflow-hidden">
      <ConversationList
        conversations={normalizedConversations}
        currentUser={normalizedCurrentUser}
        activeId={conversationId}
        onSelectConversation={(conv) => navigate(`/dashboard/messages/${conv.id}`)}
        contacts={contacts}
        onCreateGroup={handleCreateGroup}
        onStartDirectChat={handleStartDirectChat}
        isLoading={chatsLoading}
      />
      {activeConversation? (
        <ChatWindow
          conversation={activeConversation}
          messages={activeMessages}
          currentUser={normalizedCurrentUser}
          onSendMessage={handleSendMessage}
          onReact={handleReact}
          onForward={handleForward}
          onBack={goBack}
          isMobile={isMobile}
          onDelete={handleDelete}
          allConversations={normalizedConversations}
          setConversations={() => {}}
          contacts={contacts}
          onCreateGroup={handleCreateGroup}
        />
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
};

export default MessagesPage;