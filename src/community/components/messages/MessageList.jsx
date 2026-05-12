import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

const MessageList = ({ messages = [], currentUser, onReply, onReact, onForward, onDelete, conversation }) => {
  const bottomRef = useRef(null);

  // ← SAFE: filter out null/undefined messages first
  const safeMessages = (messages || []).filter(m => m && m.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages]);

  // ← SAFE: handle null/invalid dates
  const formatDateSeparator = (date) => {
    if (!date) return "";
    try {
      if (isToday(date)) return "Today";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  let lastDate = null;

  if (!currentUser) return null; // ← guard

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {safeMessages.length === 0? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No messages yet
        </div>
      ) : (
        safeMessages.map((msg, idx) => {
          // ← SAFE: skip if no timestamp
          const msgTimestamp = msg?.timestamp;
          if (!msgTimestamp) return null;

          let msgDate;
          try {
            msgDate = new Date(msgTimestamp);
            // Check if date is valid
            if (isNaN(msgDate.getTime())) return null;
          } catch {
            return null;
          }

          const showDateSeparator =!lastDate ||!isSameDay(lastDate, msgDate);
          lastDate = msgDate;

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateSeparator(msgDate)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isSent={msg?.senderId === currentUser?.id}
                allMessages={safeMessages}
                onReply={onReply}
                onReact={onReact}
                onForward={onForward}
                onDelete={onDelete}
                currentUser={currentUser}
                conversation={conversation}
              />
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
