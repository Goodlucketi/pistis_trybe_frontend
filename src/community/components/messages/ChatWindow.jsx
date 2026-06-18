import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ForwardModal from "./ForwardModal";
import GroupInfoModal from "./GroupInfoModal";
import { useSocket } from "../../../hooks/useSocket";

const ChatWindow = ({
  conversation, messages = [], currentUser, onSendMessage, onReact,
  onForward, onBack, isMobile, onDelete, allConversations, setConversations,
  contacts, onCreateGroup,
}) => {
  const [replyTo, setReplyTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // FIX: Track who is typing in this conversation
  const [typingUsers, setTypingUsers] = useState(new Set());
  // FIX: Track online presence per user
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const { on } = useSocket();

  if (!currentUser) return null;

  // Keyboard height on mobile
  useEffect(() => {
    if (!isMobile || !window.visualViewport) return;
    const handleResize = () => {
      const diff = window.innerHeight - window.visualViewport.height;
      setKeyboardHeight(diff > 150 ? diff : 0);
    };
    window.visualViewport.addEventListener("resize", handleResize);
    handleResize();
    return () => window.visualViewport.removeEventListener("resize", handleResize);
  }, [isMobile]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // FIX: Listen for typing events from socket
  useEffect(() => {
    const offStart = on("user:typing", ({ userId, conversationId: cid }) => {
      if (cid !== conversation?.id) return;
      setTypingUsers((prev) => new Set([...prev, userId]));
    });
    const offStop = on("user:stopped_typing", ({ userId, conversationId: cid }) => {
      if (cid !== conversation?.id) return;
      setTypingUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    });
    // Clear all typing when conversation changes
    setTypingUsers(new Set());
    return () => { offStart(); offStop(); };
  }, [on, conversation?.id]);

  // FIX: Listen for presence events
  useEffect(() => {
    const offOnline = on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });
    const offOffline = on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    });
    return () => { offOnline(); offOffline(); };
  }, [on]);

  const handleSend = ({ text, attachments, replyTo: replyId }) => {
    onSendMessage({ text, attachments, replyTo: replyId });
    setReplyTo(null);
  };

  const isGroup = conversation?.type === "group";
  const otherParticipant = !isGroup
    ? conversation?.participants?.find((p) => p?.id !== currentUser?.id)
    : null;

  // Merge socket online state into conversation for header
  const enrichedConversation = {
    ...conversation,
    isTyping: typingUsers.size > 0,
    participants: (conversation?.participants || []).map((p) => ({
      ...p,
      online: p?.id ? onlineUsers.has(p.id) || p.online : p.online,
    })),
  };

  const handleAddMembers = (newMembers) => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) =>
      prev.map((c) =>
        c?.id === conversation.id
          ? { ...c, participants: [...(c.participants || []), ...newMembers.map((m) => ({ ...m, role: "member" }))] }
          : c
      )
    );
  };

  const handleRemoveMember = (memberId) => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) =>
      prev.map((c) =>
        c?.id === conversation.id
          ? { ...c, participants: (c.participants || []).filter((p) => p?.id !== memberId) }
          : c
      )
    );
  };

  const handlePromoteAdmin = (memberId) => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) =>
      prev.map((c) =>
        c?.id === conversation.id
          ? { ...c, participants: (c.participants || []).map((p) => (p?.id === memberId ? { ...p, role: "admin" } : p)) }
          : c
      )
    );
  };

  const handleLeaveGroup = () => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) => prev.filter((c) => c?.id !== conversation.id));
    onBack?.();
  };

  const handleDeleteGroup = () => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) => prev.filter((c) => c?.id !== conversation.id));
    onBack?.();
  };

  const handleUpdateGroupName = (newName) => {
    if (!setConversations || !conversation?.id) return;
    setConversations((prev) =>
      prev.map((c) => (c?.id === conversation.id ? { ...c, name: newName } : c))
    );
  };

  const safeMessages = (messages || []).filter((m) => m && m.id);
  const safeConversations = (allConversations || []).filter((c) => c && c.id);

  return (
    <div className="flex flex-col h-[100vh] md:h-full w-full bg-gray-50 overflow-hidden relative">
      {conversation && (
        <>
          <div className="shrink-0 z-10 sticky top-0 bg-white border-b border-gray-200">
            <ChatHeader
              conversation={enrichedConversation}
              currentUser={currentUser}
              onBack={onBack}
              isMobile={isMobile}
              onSearch={() => {}}
              onOpenGroupInfo={() => setShowGroupInfo(true)}
            />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-10">
            <MessageList
              messages={safeMessages}
              currentUser={currentUser}
              conversation={enrichedConversation}
              onReply={setReplyTo}
              onReact={onReact}
              onDelete={onDelete}
              onForward={(msg) => setForwardingMessage(msg)}
            />

            {/* FIX: Typing indicator bubble */}
            {typingUsers.size > 0 && (
              <div className="px-4 pb-2 flex items-center gap-2">
                <div className="bg-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-400">
                  {isGroup
                    ? `${typingUsers.size} ${typingUsers.size === 1 ? "person is" : "people are"} typing...`
                    : `${otherParticipant?.name || "Typing"}...`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-20" />
          </div>
        </>
      )}

      <div
        className="absolute left-0 right-0 bg-white border-t border-gray-200 z-20 transition-all duration-200"
        style={{ bottom: isMobile ? `calc(${keyboardHeight}px + env(safe-area-inset-bottom))` : "0px" }}
      >
        <MessageInput
          onSendMessage={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          autoFocus={true}
          conversationId={conversation?.id}
        />
      </div>

      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          conversations={safeConversations.filter((c) => c.id !== conversation?.id)}
          onConfirm={(targetId) => { onForward(forwardingMessage, targetId); setForwardingMessage(null); }}
          onClose={() => setForwardingMessage(null)}
        />
      )}

      {showGroupInfo && conversation?.type === "group" && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          conversation={enrichedConversation}
          currentUser={currentUser}
          contacts={contacts || []}
          onAddMembers={handleAddMembers}
          onRemoveMember={handleRemoveMember}
          onPromoteAdmin={handlePromoteAdmin}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onUpdateGroupName={handleUpdateGroupName}
          onUpdateGroupAvatar={() => {}}
        />
      )}
    </div>
  );
};

export default ChatWindow;
