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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messagesEndRef = useRef(null);

  if (!currentUser) return null;

  useEffect(() => {
    if (!isMobile ||!window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      const heightDiff = window.innerHeight - viewport.height;
      setKeyboardHeight(heightDiff > 150? heightDiff : 0);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize();
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = ({ text, attachments, replyTo: replyId }) => {
    onSendMessage({ text, attachments, replyTo: replyId });
    setReplyTo(null);
  };

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

  const safeMessages = (messages || []).filter(m => m && m.id);
  const safeConversations = (allConversations || []).filter(c => c && c.id);

  return (
    <div className="flex flex-col h-[100vh] md:h-full w-full bg-gray-50 overflow-hidden relative">
      {conversation && (
        <>
          <div className="shrink-0 z-10 sticky top-0 bg-white border-b border-gray-200">
            <ChatHeader
              conversation={conversation}
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
              conversation={conversation}
              onReply={setReplyTo}
              onReact={onReact}
              onDelete={onDelete}
              onForward={(msg) => setForwardingMessage(msg)}
            />
            <div ref={messagesEndRef} className = "h-20" />
          </div>
        </>
      )}

      <div
        className="absolute left-0 right-0 bg-white border-t border-gray-200 p-3 z-20 transition-all duration-200"
        style={{
          bottom: isMobile? `calc(${keyboardHeight}px + env(safe-area-inset-bottom))` : '0px'
        }}
      >
        <MessageInput
          onSendMessage={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          autoFocus={true}
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