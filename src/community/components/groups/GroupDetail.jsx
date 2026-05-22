import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Settings, ImageIcon, Video, Paperclip, X } from "lucide-react";
import { getGroupById, joinLeaveGroup, getGroupPosts, createGroupPost } from "../../../services/GroupService";
import { getMe } from "../../../services/UserService";
import getErrorMessage from "../../../hooks/useErrorToast";
import PostCard from "../../../shared/PostCard";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const fileInputRef = useRef(null);

  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id),
    enabled:!!id,
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading
  } = useInfiniteQuery({
    queryKey: ["group-posts", id],
    queryFn: ({ pageParam }) => getGroupPosts(id, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled:!!id && activeTab === "posts",
  });

  const posts = postsData?.pages.flatMap(p => p.posts)?? [];

  const joinMutation = useMutation({
    mutationFn: () => joinLeaveGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", id] }),
    onError: (e) => alert(getErrorMessage(e)),
  });

  const createPostMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("text", newPost);
      attachments.forEach((file) => formData.append("files", file));
      return createGroupPost({ groupId: id, formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts", id] });
      setNewPost("");
      setAttachments([]);
    },
    onError: (e) => alert(getErrorMessage(e)),
  });

  const likeMutation = useMutation({
    mutationFn: (postId) => likeGroupPost({ postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts", id] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => deleteGroupPost({ groupId: id, postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts", id] });
    },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev,...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i!== index));
  };

  if (groupLoading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!group) return <div className="p-8 text-center text-gray-400">Group not found</div>;

  const userRole = group.userRole || "non-member";
  const isMember = userRole!== "non-member";
  const isAdmin = userRole === "admin";
  const isOwnPost = (post) => post.authorId?._id === currentUser?._id;


  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden border border-gray-100">
        <div
          className="h-44 w-full bg-cover bg-center bg-gradient-to-br from-[#401667] to-purple-400 flex items-center justify-center"
          style={group.coverUrl? { backgroundImage: `url(${group.coverUrl})` } : {}}
        >
          {!group.coverUrl && <ImageIcon className="w-10 h-10 text-white/40" />}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate("/dashboard/groups")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition"
              >
                <ArrowLeft size={16} /> Back to Groups
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.description && <p className="text-gray-500 text-sm mt-1">{group.description}</p>}

              <div className="flex items-center flex-wrap gap-3 mt-3">
                <Link
                  to={`/dashboard/groups/${id}/members`}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#401667] transition"
                >
                  <Users size={15} /> {group.membersCount || 0} members
                </Link>
                {isAdmin && <span className="px-2.5 py-0.5 bg-[#401667] text-white text-xs rounded-full">Admin</span>}
                {userRole === "member" && <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Member</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              {!isMember? (
                <button
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  className="px-4 py-2 bg-[#401667] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {joinMutation.isPending? "..." : "Join Group"}
                </button>
              ) : (
                <button
                  onClick={() => { if (confirm("Leave this group?")) joinMutation.mutate(); }}
                  disabled={joinMutation.isPending}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {joinMutation.isPending? "..." : "Leave"}
                </button>
              )}
              {isAdmin && (
                <Link to={`/dashboard/groups/${id}/settings`} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <Settings size={18} className="text-gray-600" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex border-t border-gray-100">
          {["posts", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition ${
                activeTab === tab
              ? "text-[#401667] border-b-2 border-[#401667]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "posts" && (
        <div className="space-y-4">
          {isMember && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex gap-3">
                {currentUser?.avatarUrl? (
                  <img src={currentUser.avatarUrl} className="w-9 h-9 rounded-full object-cover shrink-0" alt="me" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {currentUser?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the group..."
                    rows={2}
                    className="w-full resize-none outline-none text-sm placeholder:text-gray-400 text-gray-800"
                  />

                  {/* Attachment previews */}
                  {attachments.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="relative">
                          {file.type.startsWith('image/')? (
                            <img
                              src={URL.createObjectURL(file)}
                              className="w-20 h-20 object-cover rounded-lg"
                              alt="preview"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Paperclip size={20} className="text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ImageIcon size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Video size={18} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => createPostMutation.mutate()}
                  disabled={!newPost.trim() && attachments.length === 0 || createPostMutation.isPending}
                  className="px-5 py-1.5 bg-[#401667] text-white rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {createPostMutation.isPending? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          )}

          {!isMember && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
              Join this group to post and interact with members 🙏
            </div>
          )}

          {postsLoading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No posts yet. Be the first to share!</div>
          )}

          {posts.map((post) => (
           
            <PostCard
              key={post._id}
              post={{
                id: post._id,
                author: {
                  _id: post.authorId?._id,
                  name: post.authorId?.fullName || "Unknown",
                  avatar: post.authorId?.avatarUrl,
                },
                content: post.body,
                images: post.mediaUrls || [],
                image: post.mediaUrls?.[0] || null,
                time: new Date(post.createdAt).toLocaleDateString(),
                likes: post.likes?.length || 0,
                isLiked: post.likes?.some(likeId => likeId === currentUser?._id) || false,
                comments: 0,
                hashtags: post.hashtags || [],
              }}
              variant="feed"
              isOwnPost={isOwnPost(post)}
              onLike={() => likeMutation.mutate(post._id)}
              onDelete={() => deletePostMutation.mutate(post._id)}
            />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-[#401667] hover:bg-purple-50 rounded-xl text-sm font-medium"
            >
              {isFetchingNextPage? "Loading..." : "Load more posts"}
            </button>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <GroupMembersTab groupId={id} isAdmin={isAdmin} currentUserId={currentUser?._id} />
      )}
    </div>
  );
};

const GroupMembersTab = ({ groupId, isAdmin, currentUserId }) => {
  const queryClient = useQueryClient();
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => getGroupMembers(groupId),
  });

  const kickMutation = useMutation({
    mutationFn: (userId) => kickMember({ groupId, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-members", groupId] }),
    onError: (e) => alert(e?.message || "Failed to remove member"),
  });

  const promoteMutation = useMutation({
    mutationFn: (userId) => promoteMember({ groupId, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-members", groupId] }),
    onError: (e) => alert(e?.message || "Failed to promote member"),
  });

  const members = membersData?.members || [];

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Members ({membersData?.pagination?.total || members.length})</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {members.map((m) => {
          const member = m.userId || m;
          const role = m.role;
          return (
            <div key={member._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {member.avatarUrl? (
                  <img src={member.avatarUrl} alt={member.fullName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#401667] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.fullName || member.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{role}</p>
                </div>
              </div>

              {isAdmin && member._id!== currentUserId && (
                <div className="flex gap-1">
                  {role!== "admin" && (
                    <button
                      onClick={() => promoteMutation.mutate(member._id)}
                      disabled={promoteMutation.isPending}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#401667] text-[#401667] hover:bg-purple-50 transition disabled:opacity-50"
                    >
                      Make Admin
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm("Remove this member?")) kickMutation.mutate(member._id); }}
                    disabled={kickMutation.isPending}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupDetail;