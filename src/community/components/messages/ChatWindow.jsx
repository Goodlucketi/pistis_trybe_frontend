import { useState } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
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

  // ← GUARD: don't crash if props missing
  if (!conversation ||!currentUser) return null;

  const handleSend = ({ text, attachments, replyTo: replyId }) => {
    onSendMessage({ text, attachments, replyTo: replyId });
    setReplyTo(null);
  };

  // ← SAFE: check conversation exists before updating
  const handleAddMembers = (newMembers) => {
    if (!setConversations ||!conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id
      ? {...c, participants: [...(c.participants || []),...newMembers.map(m => ({...m, role: 'member' }))] }
        : c
    ));
  };

  const handleRemoveMember = (memberId) => {
    if (!setConversations ||!conversation?.id) return;
    setConversations(prev => prev.map(c =>
      c?.id === conversation.id
      ? {...c, participants: (c.participants || []).filter(p => p?.id!== memberId) }
        : c
    ));
  };

  const handlePromoteAdmin = (memberId) => {
    if (!setConversations ||!conversation?.id) return;
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
    if (!setConversations ||!conversation?.id) return;
    setConversations(prev => prev.filter(c => c?.id!== conversation.id));
    onBack?.();
  };

  const handleDeleteGroup = () => {
    if (!setConversations ||!conversation?.id) return;
    setConversations(prev => prev.filter(c => c?.id!== conversation.id));
    onBack?.();
  };

  const handleUpdateGroupName = (newName) => {
    if (!setConversations ||!conversation?.id) return;
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

  // ← SAFE: filter out null/undefined messages
  const safeMessages = (messages || []).filter(m => m && m.id);
  const safeConversations = (allConversations || []).filter(c => c && c.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0">
        <ChatHeader
          conversation={conversation}
          currentUser={currentUser}
          onBack={onBack}
          isMobile={isMobile}
          onSearch={handleSearch}
          onOpenGroupInfo={() => setShowGroupInfo(true)}
        />
      </div>

      <MessageList
        messages={safeMessages}
        currentUser={currentUser}
        conversation={conversation}
        onReply={setReplyTo}
        onReact={onReact}
        onDelete={onDelete}
        onForward={(msg) => setForwardingMessage(msg)}
      />

      <div className="flex-shrink-0">
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

      {/* GROUP INFO MODAL */}
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
