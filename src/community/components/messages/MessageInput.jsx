import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Smile, X, File } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useSocket } from "../../../hooks/useSocket";

const MessageInput = ({ onSendMessage, replyTo, onCancelReply, autoFocus = true, conversationId }) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const { startTyping, stopTyping } = useSocket();

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => textareaRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && conversationId) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, stopTyping]);

  const handleTextChange = useCallback((e) => {
    setText(e.target.value);

    if (!conversationId) return;

    // FIX: Emit typing indicators via socket
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(conversationId);
    }

    // Reset the stop-typing timer on every keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }, 2000);
  }, [conversationId, startTyping, stopTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    // Stop typing indicator immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current && conversationId) {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }

    onSendMessage({ text: text.trim(), attachments, replyTo: replyTo?.id || null });
    setText("");
    setAttachments([]);
    setShowEmojiPicker(false);
    onCancelReply?.();
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a?.id === id);
      if (att?.url) URL.revokeObjectURL(att.url);
      return prev.filter((a) => a?.id !== id);
    });
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + (emojiData?.emoji || ""));
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const isImage = (type) => type?.startsWith("image/") || false;

  return (
    <div className="fixed bottom-15 left-0 md:relative md:bottom-0 w-full">
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={400} previewConfig={{ showPreview: false }} />
        </div>
      )}

      {replyTo && (
        <div className="px-4 pt-3 pb-2 border-t border-gray-200 bg-purple-50 flex items-start justify-between gap-3">
          <div className="flex-1 border-l-2 border-purple-600 pl-3 min-w-0">
            <p className="text-xs font-semibold text-purple-700">Replying to</p>
            <p className="text-sm text-gray-800 truncate">{replyTo?.text || "Message"}</p>
          </div>
          <button type="button" onClick={onCancelReply} className="p-1 hover:bg-purple-100 rounded-full flex-shrink-0">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="px-4 pt-3 pb-1 border-t border-gray-200 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {attachments.map((file) => (
              <div key={file?.id} className="relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                {isImage(file?.type) ? (
                  <img src={file?.url} alt={file?.name || "attachment"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                    <File className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600 text-center truncate w-full px-1">{file?.name || "file"}</span>
                  </div>
                )}
                <button type="button" onClick={() => removeAttachment(file?.id)}
                  className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full flex-shrink-0 ${showEmojiPicker ? "bg-purple-100" : "hover:bg-gray-100"}`}>
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 p-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-base resize-none max-h-32"
            style={{ minHeight: "44px", fontSize: "16px" }}
          />

          <button type="submit" disabled={!text.trim() && attachments.length === 0}
            className="p-2.5 bg-[#401667] hover:bg-[#2e1048] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors flex-shrink-0">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
