import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2, X, Check, Loader2, Repeat2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toggleFollow, getFollowing } from "../services/UserService";
import { startDirectChat } from "../services/ChatService";
import { deletePost, editPost, resharePost } from "../services/PostService";
import { getComments, createComment, deleteComment } from "../services/CommentService";
import { getCurrentUser } from "../services/AuthService";
import { toast } from "react-toastify";
import ImageViewer from "./ImageViewer";
import { isVideoUrl } from "../utils/media";

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
  const [showReshareComposer, setShowReshareComposer] = useState(false);
  const [reshareCaption, setReshareCaption] = useState("");

  // For reshares, display the original post's content but with resharer's info in header
  const isReshare = post.isReshare === true;
  const originalPostIdIsString = typeof post.originalPostId === "string";
  
  // Try to get cached original post if ID is a string
  const cachedOriginalPost = isReshare && originalPostIdIsString
    ? queryClient.getQueryData(["originalPost", post.originalPostId])
    : null;
  
  // Determine which post data to display
  let displayPost;
  if (isReshare && typeof post.originalPostId === "object" && post.originalPostId) {
    // It's already a full object
    displayPost = post.originalPostId;
  } else if (cachedOriginalPost) {
    // We have it cached from a recent reshare
    displayPost = cachedOriginalPost;
  } else if (isReshare && originalPostIdIsString && post.originalPostId) {
    // It's a string ID - let's check if we can find it somewhere
    // For now, treat it as a fallback where we'll show limited info
    displayPost = post;
  } else {
    displayPost = post;
  }



  const authorName = post.authorId?.fullName || post.author?.name || post.author || "Unknown";
  const authorAvatar = post.authorId?.avatarUrl || post.author?.avatar || post.avatar;
  // const authorId = post.authorId?._id ||  post.author?._id || post.authorId;
  const authorId = (post.authorId?._id || post.author?._id || post.authorId)?.toString();
  const isOwnReshare = !!currentUser?._id && !!authorId && currentUser._id.toString() === authorId.toString();
  const postId = post._id || post.id;
  const isFeedView = variant === "feed";

  // FIX: Correct isLiked check — compare as strings
  const isLiked = Array.isArray(displayPost.likes)
    ? displayPost.likes.some((id) => (id?._id || id)?.toString() === currentUser?._id?.toString())
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
  const commentPostId = isReshare ? displayPost?._id : postId;
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", commentPostId],
    queryFn: () => getComments(commentPostId),
    enabled: showComments && !!commentPostId,
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

  // Reshare post mutation
  const reshareMutation = useMutation({
    mutationFn: () => resharePost(postId, post, reshareCaption),
    onSuccess: (data) => {
      // Cache the original post data
      if (data?.originalPostId && typeof data.originalPostId === "object") {
        queryClient.setQueryData(["originalPost", data.originalPostId._id], data.originalPostId);
      }

      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setShowReshareComposer(false);
      setReshareCaption("");

      toast.success("Post reshared successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to reshare post"
      );
    },
  });

  // Handle Copy Link
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/dashboard/posts/${postId}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied");
    } catch {
      toast.error("Failed to copy post link");
    }
  };
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
    mutationFn: () => createComment(commentPostId, commentText.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", commentPostId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setCommentText("");
      toast.success("Comment posted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to post comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentPostId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", commentPostId] });
      toast.success("Comment deleted");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to delete comment"),
  });

  // const handleShare = () => {
  //   const url = `${window.location.origin}/dashboard/posts/${postId}`;
  //   navigator.clipboard?.writeText(url).then(() => toast.info("Link copied to clipboard!"));
  // };

  const openViewer = (index) => { setViewerIndex(index); setViewerOpen(true); };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      {isReshare ? (
        // Reshare wrapper structure
        <>
          {/* Resharer header */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-6 h-6 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold">{authorName?.charAt(0)?.toUpperCase() || "?"}</span>
                </div>
              )}
              <Repeat2 className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 min-w-0 truncate">
                <button 
                  onClick={() => navigate(`/dashboard/users/${authorId}`)}
                  className="font-semibold hover:underline"
                >
                  {authorName}
                </button>
                {" "}reshared this post
              </p>
            </div>

            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 w-44">
                  {isOwnReshare ? (
                    <button onClick={() => {
                      if (window.confirm("Delete this reshare?")) deleteMutation.mutate();
                      setShowMenu(false);
                    }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600">
                      <Trash2 className="w-4 h-4" /> Delete reshare
                    </button>
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

          {/* Original post content in a nested card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            {isReshare && displayPost && displayPost !== post ? (
              <>
                {/* Original author header */}
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => navigate(`/dashboard/users/${displayPost.authorId?._id}`)}
                    className="flex items-center gap-2 text-left"
                  >
                    {displayPost.authorId?.avatarUrl ? (
                      <img src={displayPost.authorId.avatarUrl} alt={displayPost.authorId.fullName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center ring-2 ring-gray-200 shrink-0">
                        <span className="text-white text-xs font-semibold">{displayPost.authorId?.fullName?.charAt(0)?.toUpperCase() || "?"}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-xs hover:underline">{displayPost.authorId?.fullName}</p>
                    </div>
                  </button>
                </div>

                {/* Original post body */}
                {displayPost.body || displayPost.content ? (
                  <p className="text-gray-800 leading-relaxed text-sm mb-3 whitespace-pre-line break-words">
                    {displayPost.body || displayPost.content}
                  </p>
                ) : null}

            {/* Original post media */}
            {(displayPost.mediaUrls || displayPost.images)?.length > 0 && (() => {
              const imgs = displayPost.mediaUrls || displayPost.images;
              return (
                <div className={`mb-3 ${imgs.length === 1 ? "" : "grid grid-cols-2 gap-1"} rounded-lg overflow-hidden`}>
                  {imgs.slice(0, 4).map((url, i) => {
                    const isOverlay = imgs.length > 4 && i === 3;
                    const isVideo = isVideoUrl(url);
                    const imgClass = `w-full object-cover ${imgs.length === 1 ? "max-h-60 rounded-lg" : "h-32"}`;
                    return (
                      <div key={i} className={imgs.length === 3 && i === 0 ? "row-span-2" : ""}>
                        {isOverlay ? (
                          <div className="relative cursor-pointer" onClick={() => openViewer(3)}>
                            {isVideo ? (
                              <video src={url} preload="metadata" className="w-full h-32 object-cover bg-black" />
                            ) : (
                              <img src={url} alt="" className="w-full h-32 object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-lg font-bold">+{imgs.length - 4}</span>
                            </div>
                          </div>
                        ) : isVideo ? (
                          <video
                            src={url}
                            controls
                            preload="metadata"
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full object-cover bg-black cursor-pointer ${imgs.length === 1 ? "max-h-60 rounded-lg" : "h-32"}`}
                          />
                        ) : (
                          <img src={url} alt={`attachment ${i + 1}`} onClick={() => openViewer(i)}
                            className={`w-full object-cover cursor-pointer hover:opacity-95 transition ${imgClass}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Original post hashtags */}
            {displayPost.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {displayPost.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-600 text-xs font-medium hover:underline cursor-pointer">#{tag}</span>
                ))}
              </div>
            )}
              </>
            ) : null}
          </div>

          {/* Reshare engagement stats */}
          <div className="flex items-center gap-6 sm:gap-10 text-gray-600 text-xs sm:text-sm">
            <button onClick={onLike} className={`flex items-center gap-1.5 transition cursor-pointer ${isLiked ? "text-[#401667]" : "hover:text-red-600"}`}>
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-[#401667] text-[#401667]" : "text-gray-500"}`} />
              <span className={`text-sm font-medium ${isLiked ? "text-[#401667]" : "text-gray-500"}`}>{displayPost.likes?.length || 0}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${showComments ? "text-purple-600" : "hover:text-blue-600"}`}>
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{displayPost.commentsCount ?? comments.length ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => reshareMutation.mutate()}
              disabled={reshareMutation.isPending}
              className="flex items-center gap-1.5 transition hover:text-blue-600 cursor-pointer text-gray-600 disabled:opacity-50"
              title="Reshare post"
            >
              <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 transition hover:text-green-600 cursor-pointer text-gray-600"
              title="Copy post link"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </>
      ) : (
        // Regular post structure
        <>
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
          {displayPost.body || displayPost.content}
        </p>
      )}

      {/* Images */}
      {(displayPost.mediaUrls || displayPost.images)?.length > 0 && (() => {
        const imgs = displayPost.mediaUrls || displayPost.images;
        return (
          <div className={`mb-4 sm:mb-6 ${imgs.length === 1 ? "" : "grid grid-cols-2 gap-1"} rounded-xl overflow-hidden`}>
            {imgs.slice(0, 4).map((url, i) => {
              const isOverlay = imgs.length > 4 && i === 3;
              const isVideo = isVideoUrl(url);
              const imgClass = `w-full object-cover ${imgs.length === 1 ? "max-h-80 rounded-xl" : "h-40 sm:h-48"}`;
              return (
                <div key={i} className={imgs.length === 3 && i === 0 ? "row-span-2" : ""}>
                  {isOverlay ? (
                    <div className="relative cursor-pointer" onClick={() => openViewer(3)}>
                      {isVideo ? (
                        <video src={url} preload="metadata" className="w-full h-40 sm:h-48 object-cover bg-black" />
                      ) : (
                        <img src={url} alt="" className="w-full h-40 sm:h-48 object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">+{imgs.length - 4}</span>
                      </div>
                    </div>
                  ) : isVideo ? (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full object-cover bg-black cursor-pointer ${imgs.length === 1 ? "max-h-80 rounded-xl" : "h-40 sm:h-48"}`}
                    />
                  ) : (
                    <img src={url} alt={`attachment ${i + 1}`} onClick={() => openViewer(i)}
                      className={`w-full object-cover cursor-pointer hover:opacity-95 transition ${imgClass}`} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Hashtags */}
      {displayPost.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {displayPost.hashtags.map((tag, i) => (
            <span key={i} className="text-blue-600 text-xs sm:text-sm font-medium hover:underline cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-6 sm:gap-10 text-gray-600 text-xs sm:text-sm">
        <button onClick={onLike} className={`flex items-center gap-1.5 transition cursor-pointer ${isLiked ? "text-[#401667]" : "hover:text-red-600"}`}>
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-[#401667] text-[#401667]" : "text-gray-500"}`} />
          <span className={`text-sm font-medium ${isLiked ? "text-[#401667]" : "text-gray-500"}`}>{displayPost.likes?.length || 0}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition cursor-pointer ${showComments ? "text-purple-600" : "hover:text-blue-600"}`}>
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{displayPost.commentsCount ?? comments.length ?? 0}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowReshareComposer((prev) => !prev)}
          disabled={reshareMutation.isPending}
          className="flex items-center gap-1.5 transition hover:text-blue-600 cursor-pointer text-gray-600 disabled:opacity-50"
          title="Reshare post"
        >
          <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 transition hover:text-green-600 cursor-pointer text-gray-600"
          title="Copy post link"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {showReshareComposer && (
        <div className="mt-4 border border-gray-200 rounded-2xl p-3 bg-gray-50">
          <textarea
            value={reshareCaption}
            onChange={(e) => setReshareCaption(e.target.value)}
            rows={3}
            placeholder="Add a caption to your reshare..."
            className="w-full resize-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReshareComposer(false);
                setReshareCaption("");
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => reshareMutation.mutate()}
              disabled={reshareMutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-[#401667] text-white text-sm disabled:opacity-50"
            >
              {reshareMutation.isPending ? "Sharing..." : "Share"}
            </button>
          </div>
        </div>
      )}
        </>
      )}

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
        images={displayPost.mediaUrls || displayPost.images || []} startIndex={viewerIndex} 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} />
    </div>
  );
};

export default PostCard;
