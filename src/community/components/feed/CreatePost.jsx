import { useRef, useState, useCallback } from "react";
import { Image, Video, X, UploadCloud } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "../ui/Card";
import { getMe } from "../../../services/UserService";
import { createPost } from "../../../services/PostService";

const MAX_FILES = 5;

const CreatePost = () => {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const postMutation = useMutation({
    mutationFn: (formData) => createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setText("");
      setMediaFiles([]);
    },
    onError: (error) => {
      alert(error?.message || "Failed to create post. Please try again.");
    },
  });

  const handleFiles = (files) => {
    const incoming = Array.from(files).slice(0, MAX_FILES);
    setMediaFiles((prev) => [...prev, ...incoming].slice(0, MAX_FILES));
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    handleFiles(e.target.files);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!text.trim() && mediaFiles.length === 0) return;

    const formData = new FormData();
    formData.append("body", text);
    mediaFiles.forEach((file) => formData.append("files", file));

    postMutation.mutate(formData);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, []);

  return (
    <Card className="p-4 rounded-2xl">
      <div
        className={`flex gap-3 transition ${isDragging ? "bg-purple-50" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {/* Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's in your heart today?"
            className="w-full resize-none outline-none text-sm placeholder:text-gray-400"
            rows={3}
          />

          {isDragging && (
            <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
              <UploadCloud size={14} />
              Drop files to upload
            </div>
          )}

          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleFileChange} />

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {mediaFiles.map((file, index) => {
                const url = URL.createObjectURL(file);
                const isVideo = file.type.startsWith("video");
                return (
                  <div key={index} className="relative rounded-xl overflow-hidden border">
                    {isVideo ? (
                      <video src={url} className="w-full h-24 object-cover" />
                    ) : (
                      <img src={url} alt="preview" className="w-full h-24 object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress bar */}
          {postMutation.isPending && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 h-2 animate-pulse w-full" />
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-gray-500">
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
              className="bg-[#6D28D9] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#5B21B6] transition disabled:opacity-50"
            >
              {postMutation.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;