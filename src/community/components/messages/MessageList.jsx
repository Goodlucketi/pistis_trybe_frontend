import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

const MessageList = ({ messages, currentUser, onReply, onReact, onForward,  onDelete, conversation }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDateSeparator = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  let lastDate = null;

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {messages.map((msg, idx) => {
        const msgDate = new Date(msg.timestamp);
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
              isSent={msg.senderId === currentUser.id}
              allMessages={messages}
              onReply={onReply}
              onReact={onReact}
              onForward={onForward}
              onDelete={onDelete}
              currentUser={currentUser}
              conversation={conversation}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;