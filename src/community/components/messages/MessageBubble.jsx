import { format } from "date-fns";
import { Check, CheckCheck, Reply, Smile, MoreHorizontal, Trash2, Forward, File, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MessageBubble = ({
  message,
  isSent,
  allMessages = [],
  currentUser,
  conversation,
  onReply,
  onReact,
  onForward,
  onDelete,
  isMobile,
}) => {
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const menuRef = useRef(null);

  const allowedReactions = [
    { emoji: "👍", label: "Like" },
    { emoji: "❤️", label: "Love" },
    { emoji: "🙏", label: "Amen" },
    { emoji: "🤗", label: "Care" },
  ];

  // ← GUARDS: return null if critical data missing
  if (!message ||!currentUser) return null;

  const otherUser = conversation?.participants?.find((p) => p?.id!== currentUser?.id);
  const otherUserName = otherUser?.name || "Unknown";

  // Find replied message — support both string and object replyTo
  const replyToId = typeof message.replyTo === "object"? message.replyTo?._id : message.replyTo;
  const repliedMessage = replyToId
  ? allMessages.find((m) => m?.id === replyToId)
    : null;
  const repliedSender = repliedMessage
  ? repliedMessage.senderId === currentUser.id
     ? "You"
      : otherUserName
    : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current &&!menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowReactPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0]?.clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile ||!touchStart ||!touchEnd) return;
    const distance = touchEnd - touchStart;
    if (distance > 80) {
      onReply(message);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const ReadStatus = () => {
    if (!isSent) return null;
    if (message.status === "read") return <CheckCheck className="w-4 h-4 text-purple-400" />;
    if (message.status === "delivered") return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  const isImage = (type) => type?.startsWith("image/");
  const isVideo = (type) => type?.startsWith("video/");

  const formatFileSize = (bytes) => {
    if (!bytes && bytes!== 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Reactions from backend are { emoji: [userId,...] }
  const reactions = message.reactions || {};
  const hasReactions = Object.keys(reactions).length > 0;

  // Sender info for group chats
  const senderInGroup = conversation?.participants?.find(
    (p) => p?.id === message.senderId
  );

  // ← SAFE TIMESTAMP FORMATTING
  const timestamp = (() => {
    if (!message.timestamp) return "";
    try {
      const date = new Date(message.timestamp);
      if (isNaN(date.getTime())) return "";
      return format(date, "h:mm a");
    } catch {
      return "";
    }
  })();

  return (
    <div className={`flex ${isSent? "justify-end" : "justify-start"} mb-1 px-4`}>
      <div
        className={`max-w-[70%] ${isSent? "items-end" : "items-start"} flex flex-col relative`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reply preview */}
        {repliedMessage && (
          <div
            onClick={() =>
              document.getElementById(`msg-${repliedMessage.id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
            className={`mb-1 px-3 py-2 rounded-lg cursor-pointer ${
              isSent
              ? "bg-purple-700/60 border-l-2 border-purple-300"
                : "bg-[#F9F3FF]/80 border-l-2 border-purple-300"
            }`}
          >
            <p className={`text-xs font-semibold mb-0.5 ${isSent? "text-purple-200" : "text-purple-700"}`}>
              {repliedSender}
            </p>
            <p className={`text-xs line-clamp-2 ${isSent? "text-purple-100/90" : "text-gray-700/80"}`}>
              {repliedMessage.text || "Message"}
            </p>
          </div>
        )}

        {/* Message bubble */}
        <div
          id={`msg-${message.id}`}
          className={`rounded-2xl overflow-hidden relative ${
            isSent
            ? "bg-white text-gray-900 rounded-br-md border border-gray-200"
              : "bg-[#F9F3FF] text-gray-900 rounded-bl-md border border-purple-100"
          }`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-1">
              {message.attachments.map((file) => (
                <div key={file?.id || file?.url}>
                  {isImage(file?.type)? (
                    <img
                      src={file?.url}
                      alt={file?.name || "attachment"}
                      className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(file?.url, "_blank")}
                    />
                  ) : isVideo(file?.type)? (
                    <video src={file?.url} controls className="w-full" />
                  ) : (
                    <div className="p-2">
                      <a
                        href={file?.url}
                        download={file?.name}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-purple-100"
                      >
                        <div className="p-2 rounded-lg bg-purple-50">
                          <File className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-900">{file?.name || "file"}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file?.size)}</p>
                        </div>
                        <Download className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          {message.text && (
            <div className="px-4 pt-2 pb-1">
              <p className="text-sm break-words">{message.text}</p>
            </div>
          )}

          {/* Bottom bar */}
          <div className={`px-4 ${message.text? "pb-2" : "py-2"} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {/* Group sender info */}
              {!isSent && conversation?.type === "group" && senderInGroup && (
                <>
                  {senderInGroup.avatar? (
                    <img src={senderInGroup.avatar} className="w-4 h-4 rounded-full" alt="" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#401667] flex items-center justify-center">
                      <span className="text-white text-">
                        {senderInGroup.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600 font-medium">{senderInGroup.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{timestamp}</span>
              <ReadStatus />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Reactions */}
        {hasReactions && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(reactions).map(([emoji, userIds]) => {
              const usersArray = Array.isArray(userIds)? userIds : [];
              const iReacted = usersArray.includes(currentUser.id);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`bg-white border rounded-full px-2 py-0.5 text-sm hover:bg-gray-50 shadow-sm ${
                    iReacted? "border-purple-400 bg-purple-50" : "border-gray-200"
                  }`}
                >
                  {emoji} {usersArray.length > 1 && <span className="text-xs">{usersArray.length}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Context menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className={`absolute ${isSent? "right-0" : "left-0"} bottom-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 w-40`}
          >
            <button
              onClick={() => { setShowMenu(false); setShowReactPicker(true); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-900"
            >
              <Smile className="w-4 h-4" /> React
            </button>
            <button
              onClick={() => { onReply(message); setShowMenu(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-900"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button
              onClick={() => { onForward(message); setShowMenu(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-900"
            >
              <Forward className="w-4 h-4" /> Forward
            </button>
            {isSent && (
              <>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  onClick={() => { onDelete(message.id); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Reaction picker */}
        {showReactPicker && (
          <div
            ref={menuRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-white rounded-full shadow-lg border border-gray-200 px-3 py-2 flex gap-2 z-20"
          >
            {allowedReactions.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => { onReact(message.id, emoji); setShowReactPicker(false); setShowMenu(false); }}
                className="hover:scale-125 transition-transform text-xl"
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
