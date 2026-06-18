import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toggleFollow, getFollowing } from "../services/UserService";
import { startDirectChat } from "../services/ChatService";
import { deletePost, editPost } from "../services/PostService";
import { getComments, createComment, deleteComment } from "../services/CommentService";
import { getCurrentUser } from "../services/AuthService";
import { toast } from "react-toastify";
import ImageViewer from "./ImageViewer";

const PostCard = ({ post, variant = "default", isOwnPost = false, onLike, onDelete }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.body || post.content || "");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [commentText, setCommentText] = useState("");

  const authorName = post.authorId?.fullName || post.author?.name || post.author || "Unknown";
  const authorAvatar = post.authorId?.avatarUrl || post.author?.avatar || post.avatar;
  // const authorId = post.authorId?._id ||  post.author?._id || post.authorId;
  const authorId = (post.authorId?._id || post.author?._id || post.authorId)?.toString();
  const postId = post._id || post.id;
  const isFeedView = variant === "feed";

  // FIX: Correct isLiked check — compare as strings
  const isLiked = Array.isArray(post.likes)
    ? post.likes.some((id) => (id?._id || id)?.toString() === currentUser?._id?.toString())
    : false;

  const { data: followingData } = useQuery({
    queryKey: ["following", currentUser?._id],
    queryFn: () => getFollowing(currentUser?._id),
    enabled: !!currentUser?._id && !isOwnPost,
  });

  const isFollowing = followingData?.following?.some(
    (u) => u._id?.toString() === authorId?.toString()
  );

  // Comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: showComments && !!postId,
  });
  const comments = commentsData?.comments || [];

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(authorId),

    // Flip immediately before the request completes
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['following', currentUser?._id] });
      const previous = queryClient.getQueryData(['following', currentUser?._id]);

      queryClient.setQueryData(['following', currentUser?._id], (old) => {
        if (!old) return old;
        const alreadyFollowing = old.following?.some(
          (u) => u._id?.toString() === authorId?.toString()
        );
        return {
          ...old,
          following: alreadyFollowing
            ? old.following.filter((u) => u._id?.toString() !== authorId?.toString())
            : [...(old.following || []), { _id: authorId }],
        };
      });

      return { previous };
    },

    // If the request fails, roll back
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['following', currentUser?._id], context.previous);
      }
      toast.error("Failed to follow user");
    },

    // Always sync with server after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following', currentUser?._id] });
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => startDirectChat(authorId),
    onSuccess: (chat) => navigate(`/dashboard/messages/${chat._id}`),
    onError: (e) => toast.error(e?.response?.data?.message || "Could not start chat"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      onDelete?.(postId);
      toast.success("Post deleted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to delete post"),
  });

  const editMutation = useMutation({
    mutationFn: () => editPost(postId, { body: editText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      setEditing(false);
      toast.success("Post updated");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update post"),
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(postId, commentText.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setCommentText("");
      toast.success("Comment posted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to post comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to delete comment"),
  });

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/posts/${postId}`;
    navigator.clipboard?.writeText(url).then(() => toast.info("Link copied to clipboard!"));
  };

  const openViewer = (index) => { setViewerIndex(index); setViewerOpen(true); };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <button
          onClick={() => isOwnPost ? navigate("/dashboard/profile") : navigate(`/dashboard/users/${authorId}`)}
          className="flex items-center gap-3 text-left"
        >
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#401667] flex items-center justify-center ring-2 ring-gray-100 shrink-0">
              <span className="text-white text-sm font-semibold">{authorName?.charAt(0)?.toUpperCase() || "?"}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm sm:text-base hover:underline">{authorName}</p>
            {post.createdAt && (
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2 relative">
          {isFeedView && !isOwnPost && (
            <>
              <button onClick={() => messageMutation.mutate()} disabled={messageMutation.isPending}
                className="text-sm px-2 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50" title="Message">
                <Send className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition disabled:opacity-50 ${
                  isFollowing ? "text-gray-500 border border-gray-300 hover:border-red-300 hover:text-red-500"
                  : "text-[#401667] border border-[#401667] hover:bg-[#401667] hover:text-white"}`}>
                {followMutation.isPending ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            </>
          )}

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 w-44">
                {isOwnPost ? (
                  <>
                    <button onClick={() => { setEditing(true); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                      <Pencil className="w-4 h-4" /> Edit post
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button onClick={() => { if (window.confirm("Delete this post?")) deleteMutation.mutate(); setShowMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600">
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                  </>
                ) : (
                  <button onClick={() => { navigate(`/dashboard/users/${authorId}`); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                    View profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="mb-4">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows={4} />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"><X className="w-4 h-4" /></button>
            <button onClick={() => editMutation.mutate()} disabled={editMutation.isPending || !editText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#401667] text-white text-sm disabled:opacity-50 flex items-center gap-1">
              <Check className="w-4 h-4" /> {editMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 leading-relaxed text-sm sm:text-[15.2px] mb-4 sm:mb-6 whitespace-pre-line break-words">
          {post.body || post.content}
        </p>
      )}

      {/* Images */}
      {(post.mediaUrls || post.images)?.length > 0 && (() => {
        const imgs = post.mediaUrls || post.images;
        return (
          <div className={`mb-4 sm:mb-6 ${imgs.length === 1 ? "" : "grid grid-cols-2 gap-1"} rounded-xl overflow-hidden`}>
            {imgs.slice(0, 4).map((url, i) => {
              const isOverlay = imgs.length > 4 && i === 3;
              return (
                <div key={i} className={imgs.length === 3 && i === 0 ? "row-span-2" : ""}>
                  {isOverlay ? (
                    <div className="relative">
                      <img src={url} alt="" className="w-full h-40 sm:h-48 object-cover" />
                      <div onClick={() => openViewer(3)} className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                        <span className="text-white text-xl font-bold">+{imgs.length - 4}</span>
                      </div>
                    </div>
                  ) : (
                    <img src={url} alt={`attachment ${i + 1}`} onClick={() => openViewer(i)}
                      className={`w-full object-cover cursor-pointer hover:opacity-95 transition ${imgs.length === 1 ? "max-h-80 rounded-xl" : "h-40 sm:h-48"}`} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag, i) => (
            <span key={i} className="text-blue-600 text-xs sm:text-sm font-medium hover:underline cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-6 sm:gap-10 text-gray-600 text-xs sm:text-sm">
        <button onClick={onLike} className={`flex items-center gap-1.5 transition cursor-pointer ${isLiked ? "text-[#401667]" : "hover:text-red-600"}`}>
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-[#401667] text-[#401667]" : "text-gray-500"}`} />
          <span className={`text-sm font-medium ${isLiked ? "text-[#401667]" : "text-gray-500"}`}>{post.likes?.length || 0}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition cursor-pointer ${showComments ? "text-purple-600" : "hover:text-blue-600"}`}>
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{post.commentsCount ?? comments.length ?? 0}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Add comment input */}
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {currentUser?.fullName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && commentText.trim()) { e.preventDefault(); commentMutation.mutate(); } }}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => commentMutation.mutate()}
                disabled={commentMutation.isPending || !commentText.trim()}
                className="px-3 py-2 bg-[#401667] text-white rounded-xl text-sm disabled:opacity-40 flex items-center gap-1"
              >
                {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Comment list */}
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-2 group">
                  {c.authorId?.avatarUrl ? (
                    <img src={c.authorId.avatarUrl} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">{c.authorId?.fullName?.charAt(0) || "?"}</span>
                    </div>
                  )}
                  <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800">{c.authorId?.fullName || "User"}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{c.body}</p>
                  </div>
                  {c.authorId?._id === currentUser?._id && (
                    <button
                      onClick={() => deleteCommentMutation.mutate(c._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ImageViewer 
        key={`${viewerOpen}-${viewerIndex}`} 
        images={post.mediaUrls || post.images || []} startIndex={viewerIndex} 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} />
    </div>
  );
};

export default PostCard;
