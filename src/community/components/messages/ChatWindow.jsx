import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ForwardModal from "./ForwardModal";
import GroupInfoModal from "./GroupInfoModal";

const ChatWindow = ({
  conversation,
  messages = [],
  currentUser,
  onSendMessage,
  onReact,
  onForward,
  onBack,
  isMobile,
  onDelete,
  allConversations,
  setConversations,
  contacts
}) => {
  const [replyTo, setReplyTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);

  if (!conversation || !currentUser) return null;

  const handleSend = ({ text, attachments, replyTo: replyId }) => {
    onSendMessage({ text, attachments, replyTo: replyId });
    setReplyTo(null);
  };

  const handleAddMembers = (newMembers) => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id
       ? {...c, participants: [...(c.participants || []), ...newMembers.map(m => ({...m, role: 'member' }))] }
        : c
    ));
  };

  const handleRemoveMember = (memberId) => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id
       ? {...c, participants: (c.participants || []).filter(p => p?.id!== memberId) }
        : c
    ));
  };

  const handlePromoteAdmin = (memberId) => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id
       ? {
           ...c,
           participants: (c.participants || []).map(p =>
             p?.id === memberId? {...p, role: 'admin' } : p
           )
         }
        : c
    ));
  };

  const handleLeaveGroup = () => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.filter(c => c?.id!== conversation.id));
    onBack?.();
  };

  const handleDeleteGroup = () => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.filter(c => c?.id!== conversation.id));
    onBack?.();
  };

  const handleUpdateGroupName = (newName) => {
    if (!setConversations || !conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id? {...c, name: newName } : c
    ));
  };

  const handleUpdateGroupAvatar = () => {
    console.log('Update avatar clicked');
  };

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const safeMessages = (messages || []).filter(m => m && m.id);
  const safeConversations = (allConversations || []).filter(c => c && c.id);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages.length]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      {/* Header - fixed height */}
      <div className="shrink-0">
        <ChatHeader
          conversation={conversation}
          currentUser={currentUser}
          onBack={onBack}
          isMobile={isMobile}
          onSearch={handleSearch}
          onOpenGroupInfo={() => setShowGroupInfo(true)}
        />
      </div>

      {/* Messages - scrollable, takes all remaining space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <MessageList
          messages={safeMessages}
          currentUser={currentUser}
          conversation={conversation}
          onReply={setReplyTo}
          onReact={onReact}
          onDelete={onDelete}
          onForward={(msg) => setForwardingMessage(msg)}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input - sticks to bottom, won't shrink, respects iOS safe area */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <MessageInput
          onSendMessage={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>

      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          conversations={safeConversations.filter(c => c.id!== conversation?.id)}
          onConfirm={(targetId) => {
            onForward(forwardingMessage, targetId);
            setForwardingMessage(null);
          }}
          onClose={() => setForwardingMessage(null)}
        />
      )}

      {showGroupInfo && conversation?.type === 'group' && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          conversation={conversation}
          currentUser={currentUser}
          contacts={contacts || []}
          onAddMembers={handleAddMembers}
          onRemoveMember={handleRemoveMember}
          onPromoteAdmin={handlePromoteAdmin}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onUpdateGroupName={handleUpdateGroupName}
          onUpdateGroupAvatar={handleUpdateGroupAvatar}
        />
      )}
    </div>
  );
};

export default ChatWindow;