import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, MoreVertical, Users, Settings, Pin, Trash2 } from "lucide-react";
import { getGroupById, getGroupMembers, kickMember, promoteMember } from "../../../services/GroupService";
import getErrorMessage from "../../../hooks/useErrorToast";

const GroupDetail = ({ currentUserId = 1 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");

  const { data: community, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroupById(id),
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['group-posts', id],
    queryFn: ({ pageParam }) => getGroupPosts(id, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled:!!id,
  });

  const posts = postsData?.pages.flatMap(p => p.posts) ?? [];

  const member = community?.members?.find(m => m.id === currentUserId);
  const userRole = member?.role || "non-member";
  const canPost = userRole!== "non-member";

  const createPostMutation = useMutation({
    mutationFn: () => createGroupPost({ groupId: id, text: newPost }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', id] });
      setNewPost("");
    },
    onError: (e) => alert(getErrorMessage(e)),
  });

  const pinMutation = useMutation({
    mutationFn: (postId) => pinPost({ groupId: id, postId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-posts', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost({ groupId: id, postId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-posts', id] }),
  });

  if (groupLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" /></div>;
  if (!community) return <div className="p-8">Group not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${community.coverUrl})` }}
        />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <button onClick={() => navigate('/dashboard/groups')} className="flex items-center gap-2 text-gray-600 mb-3">
                <ArrowLeft size={20} /> Back
              </button>
              <h1 className="text-3xl font-bold">{community.title}</h1>
              <p className="text-gray-600 mt-1">{community.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <Link to={`/dashboard/groups/${id}/members`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#401667]">
                  <Users size={16} /> {community.membersCount} members
                </Link>
                {userRole === "admin" && (
                  <span className="px-3 py-1 bg-[#401667] text-white text-xs rounded-full">Admin</span>
                )}
                {userRole === "member" && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">Member</span>
                )}
              </div>
            </div>
            {userRole === "admin" && (
              <Link to={`/dashboard/groups/${id}/settings`} className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Post Box */}
      {canPost && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the group..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#401667]"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button 
              onClick={() => createPostMutation.mutate()}
              disabled={!newPost.trim() || createPostMutation.isPending}
              className="px-6 py-2 bg-[#401667] text-white rounded-lg hover:bg-[#2e1048] disabled:opacity-50"
            >
              {createPostMutation.isPending? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* Posts Feed with infinite scroll */}
      <div className="space-y-4">
        {posts
         .sort((a, b) => (b.pinned - a.pinned) || new Date(b.createdAt) - new Date(a.createdAt))
         .map(post => {
            const author = post.author || community.members.find(m => m.id === post.userId);
            return (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={author?.avatarUrl} alt={author?.fullName} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">{author?.fullName}</p>
                      <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    {post.pinned && <Pin size={16} className="text-[#401667]" />}
                  </div>
                  {userRole === "admin" && (
                    <div className="flex gap-2">
                      <button onClick={() => pinMutation.mutate(post._id)} className="p-1 hover:bg-gray-100 rounded">
                        <Pin size={16} className={post.pinned? "fill-[#401667] text-[#401667]" : ""} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(post._id)} className="p-1 hover:bg-gray-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-800">{post.text}</p>
              </div>
            );
          })}
        
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-[#401667] hover:bg-purple-50 rounded-xl"
          >
            {isFetchingNextPage? "Loading..." : "Load more posts"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;