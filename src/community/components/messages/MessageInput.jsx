import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, X, File, Image as ImageIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ onSendMessage, replyTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current &&!emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || attachments.length > 0) {
      onSendMessage({
        text: text.trim(),
        attachments: attachments,
        replyTo: replyTo?.id || null
      });
      setText("");
      setAttachments([]);
      setShowEmojiPicker(false);
      onCancelReply?.(); // clear reply after sending
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file
    }));
    setAttachments(prev => [...prev,...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url) URL.revokeObjectURL(attachment.url);
      return prev.filter(a => a.id!== id);
    });
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isImage = (type) => type.startsWith("image/");

  return (
    <div className="relative">
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-2 z-50"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 pt-3 pb-2 border-t border-gray-200 bg-purple-50 flex items-start justify-between gap-3">
          <div className="flex-1 border-l-2 border-purple-600 pl-3 min-w-0">
            <p className="text-xs font-semibold text-purple-700">Replying to</p>
            <p className="text-sm text-gray-800 truncate">{replyTo.text}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 hover:bg-purple-100 rounded-full flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 pb-1 border-t border-gray-200 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group"
              >
                {isImage(file.type)? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                    <File className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text- text-gray-600 text-center truncate w-full px-1">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          {/* File input - hidden */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full flex-shrink-0 ${
              showEmojiPicker? "bg-purple-100" : "hover:bg-gray-100"
            }`}
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" &&!e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm resize-none max-h-32"
            style={{ minHeight: "40px" }}
          />

          <button
            type="submit"
            disabled={!text.trim() && attachments.length === 0}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;