import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toggleFollow, getFollowing } from "../services/UserService";
import { startDirectChat } from "../services/ChatService";
import { toggleLike, deletePost, editPost } from "../services/PostService";
import { getCurrentUser } from "../services/AuthService";
import getErrorMessage from "../hooks/useErrorToast";

const PostCard = ({ post, variant = "default", isOwnPost = false, onLike, onDelete, onEdit }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || "");

  const authorName = typeof post.author === "string" ? post.author : post.author?.name;
  const authorAvatar = typeof post.author === "string" ? post.avatar : post.author?.avatar;
  const authorId = post.author?._id || post.authorId;
  const isFeedView = variant === "feed";

  // Following state
  const { data: followingData } = useQuery({
    queryKey: ['following', currentUser?._id],
    queryFn: async () => {
      const { getFollowing } = await import("../services/UserService");
      return getFollowing(currentUser?._id);
    },
    enabled: !!currentUser?._id && !isOwnPost,
  });

  const isFollowing = followingData?.following?.some(
    (u) => u._id === authorId
  );

  const isLiked = post.likedBy?.includes(currentUser?._id) || false;

  // Follow
  const followMutation = useMutation({
    mutationFn: () => toggleFollow(authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  // Message
  const messageMutation = useMutation({
    mutationFn: () => startDirectChat(authorId),
    onSuccess: (chat) => navigate(`/dashboard/messages/${chat._id}`),
    onError: (error) => alert(getErrorMessage(error)),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      onDelete?.(post.id);
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  // Edit
  const editMutation = useMutation({
    mutationFn: () => editPost(post.id, { body: editText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      setEditing(false);
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  const handleAuthorClick = () => {
    if (isOwnPost) {
      navigate("/dashboard/profile");
    } else {
      navigate(`/dashboard/users/${authorId}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <button onClick={handleAuthorClick} className="flex items-center gap-3 sm:gap-3.5 text-left">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#401667] flex items-center justify-center ring-2 ring-gray-100 shrink-0">
              <span className="text-white text-sm font-semibold">{authorName?.charAt(0)?.toUpperCase() || "?"}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm sm:text-base hover:underline">{authorName}</p>
            {post.time && <p className="text-xs text-gray-500 mt-0.5">{post.time}</p>}
          </div>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 relative">
          {isFeedView && !isOwnPost && (
            <>
              <button
                onClick={() => messageMutation.mutate()}
                disabled={messageMutation.isPending}
                className="text-sm px-2 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                title="Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                  isFollowing
                    ? "text-gray-500 border border-gray-300 hover:border-red-300 hover:text-red-500"
                    : "text-[#401667] border border-[#401667] hover:bg-[#401667] hover:text-white"
                }`}
              >
                {followMutation.isPending ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            </>
          )}

          {/* Options menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 w-44">
                {isOwnPost ? (
                  <>
                    <button
                      onClick={() => { setEditing(true); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                    >
                      <Pencil className="w-4 h-4" /> Edit post
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { navigate(`/dashboard/users/${authorId}`); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    View profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editable content */}
      {editing ? (
        <div className="mb-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={4}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !editText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#401667] text-white text-sm disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> {editMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-800 leading-relaxed text-sm sm:text-[15.2px] mb-4 sm:mb-6 whitespace-pre-line break-words">
          {post.content}
        </div>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`mb-4 sm:mb-6 ${
          post.images.length === 1 ? "" : "grid grid-cols-2 gap-1"
        } rounded-xl overflow-hidden`}>
          {post.images.slice(0, 4).map((url, index) => {
            const isLargeFirst = post.images.length === 3 && index === 0;
            const isOverlay = post.images.length > 4 && index === 3;
            return (
              <div key={index} className={isLargeFirst ? "row-span-2" : ""}>
                {isOverlay ? (
                  <div className="relative">
                    <img src={url} alt="" className="w-full h-40 sm:h-48 object-cover" />
                    <div onClick={() => window.open(url, "_blank")} className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                      <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`attachment ${index + 1}`}
                    onClick={() => window.open(url, "_blank")}
                    className={`w-full object-cover cursor-pointer hover:opacity-95 transition ${
                      post.images.length === 1 ? "max-h-80 rounded-xl" : `h-40 sm:h-48 ${isLargeFirst ? "h-full" : ""}`
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag, index) => (
            <span key={index} className="text-blue-600 text-xs sm:text-sm font-medium hover:underline cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center gap-6 sm:gap-10 text-gray-600 text-xs sm:text-sm">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 transition ${isLiked ? "text-red-500" : "hover:text-red-600"}`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-red-500" : ""}`} />
          <span>{post.likes || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 hover:text-blue-600 transition"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{post.comments || 0}</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/dashboard/posts/${post.id}`);
            alert("Link copied!");
          }}
          className="flex items-center gap-1.5 hover:text-green-600 transition"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments placeholder */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center py-3">
            Comments coming soon 🙏
          </p>
        </div>
      )}
    </div>
  );
};

export default PostCard;