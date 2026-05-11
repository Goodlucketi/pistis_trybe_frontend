import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getMe, getUserPosts, getFollowers, getFollowing, toggleFollow } from "../../services/UserService";
import { startDirectChat } from "../../services/ChatService";
import ActivityContent from "../../community/components/profile/ActivityContent";
import getErrorMessage from "../../hooks/useErrorToast";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("feed");

  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: getMe });

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await import("../../api/api").then(m =>
        m.default.get(`/users/${userId}`)
      );
      return response.data.data;
    },
    enabled: !!userId,
  });

  const { data: followersData } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });

  const { data: followingData } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });

  const isFollowing = followersData?.followers?.some(
    (f) => f._id === currentUser?._id
  );

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error) => alert(getErrorMessage(error)),
  });

  const messageMutation = useMutation({
    mutationFn: () => startDirectChat(userId),
    onSuccess: (chat) => navigate(`/dashboard/messages/${chat._id}`),
    onError: (error) => alert(getErrorMessage(error)),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 text-gray-400">User not found.</div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="relative min-h-screen pb-12">
      <div className="overflow-auto w-full px-2 py-2">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile card */}
        <div className="border mb-3 border-[#E8E8E8] bg-white p-4 sm:p-6 shadow rounded-2xl">
          <div className="flex justify-between items-start gap-4">
            {/* Left */}
            <div className="flex flex-col gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {profileUser.avatarUrl ? (
                  <img src={profileUser.avatarUrl} alt={profileUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#401667] flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {profileUser.fullName?.charAt(0)?.toUpperCase() || profileUser.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-black">
                  {profileUser.fullName || "No name set"}
                </h2>
                {profileUser.biography && (
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">{profileUser.biography}</p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-xs sm:text-sm text-gray-600">
                  <span><strong className="text-black">{followersData?.followers?.length || 0}</strong> Followers</span>
                  <span><strong className="text-black">{followingData?.following?.length || 0}</strong> Following</span>
                  <span><strong className="text-black">{postsData?.posts?.length || 0}</strong> Posts</span>
                </div>
              </div>
            </div>

            {/* Right — action buttons */}
            {!isOwnProfile && (
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => messageMutation.mutate()}
                  disabled={messageMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                    isFollowing
                      ? "border border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-300"
                      : "bg-[#401667] text-white hover:opacity-90"
                  }`}
                >
                  {followMutation.isPending ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Posts</h2>
          </div>
          <ActivityContent
            activeTab="feed"
            posts={postsData?.posts || []}
            isLoading={postsLoading}
          />
        </div>
      </div>
    </div>
  );
}