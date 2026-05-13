import { useRef, useState, useCallback } from "react";
import { X, Image, Video, UploadCloud } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../../../services/UserService";
import { createPost } from "../../../services/PostService";
import getErrorMessage from "../../../hooks/useErrorToast";

const CreatePostModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const postMutation = useMutation({
    mutationFn: (formData) => createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setText("");
      setMediaFiles([]);
      onClose();
    },
    onError: (e) => alert(getErrorMessage(e)),
  });

  const handleFiles = (files) => {
    setMediaFiles((prev) => [...prev, ...Array.from(files)].slice(0, 5));
  };

  const handleSubmit = () => {
    if (!text.trim() && mediaFiles.length === 0) return;
    const formData = new FormData();
    formData.append("body", text);
    mediaFiles.forEach((f) => formData.append("files", f));
    postMutation.mutate(formData);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div
          className={`p-5 ${isDragging ? "bg-purple-50" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover shrink-0" alt="avatar" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">{user?.fullName || "You"}</p>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's in your heart today?"
                rows={4}
                className="w-full resize-none outline-none text-sm placeholder:text-gray-400 text-gray-800"
              />
              {isDragging && (
                <div className="flex items-center gap-2 text-xs text-purple-600 mt-1">
                  <UploadCloud size={14} /> Drop files to upload
                </div>
              )}
            </div>
          </div>

          {mediaFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {mediaFiles.map((file, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border">
                  {file.type.startsWith("video") ? (
                    <video src={URL.createObjectURL(file)} className="w-full h-24 object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover" />
                  )}
                  <button
                    onClick={() => setMediaFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {postMutation.isPending && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#401667] h-1.5 animate-pulse w-full" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <div className="flex gap-2 text-gray-500">
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleFiles(e.target.files)} />
            <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden"
              onChange={(e) => handleFiles(e.target.files)} />
            <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <Image size={18} />
            </button>
            <button onClick={() => videoInputRef.current?.click()} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <Video size={18} />
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={postMutation.isPending || (!text.trim() && mediaFiles.length === 0)}
            className="px-5 py-2 bg-[#401667] text-white rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {postMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;