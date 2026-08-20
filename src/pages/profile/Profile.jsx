import { useState } from 'react';
import ProfileTopBlock from "../../community/components/profile/ProfileTopBlock";
import ActivityTabs from "../../community/components/profile/Activitytabs";
import ActivityContent from "../../community/components/profile/ActivityContent";
import { getMe } from '../../services/UserService';
import { getFollowers, getFollowing } from '../../services/UserService';
import { getUserPosts } from '../../services/UserService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { likeGroupPost, deletePost } from '../../services/GroupService';
import getErrorMessage from '../../hooks/useErrorToast';

export default function Profile() {
  const [activeTab, setActiveTab] = useState("feed");
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: followersData } = useQuery({
    queryKey: ['followers', currentUser?._id],
    queryFn: () => getFollowers(currentUser._id),
    enabled: !!currentUser?._id,
  });

  const { data: followingData } = useQuery({
    queryKey: ['following', currentUser?._id],
    queryFn: () => getFollowing(currentUser._id),
    enabled: !!currentUser?._id,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', currentUser?._id],
    queryFn: () => getUserPosts(currentUser._id),
    enabled: !!currentUser?._id,
  });

  const userPosts = postsData?.posts || [];
  
  
  const likeMutation = useMutation({
    mutationFn: (postId) => likeGroupPost({ postId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost({ postId }), // groupId not needed, backend checks author
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", currentUser._id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  
  const profileUser = currentUser ? {
    _id: currentUser._id,
    name: currentUser.fullName || currentUser.email,
    avatar: currentUser.avatarUrl,
    biography: currentUser.biography,
    followers: followersData?.followers || [],
    following: followingData?.following || [],
    posts: userPosts,
  } : null;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-12">
      <div className="overflow-auto md:mr-0 md:ml-0 w-full px-2 py-2">
        <div className="space-y-6 sm:space-y-10 border mb-3 border-[#E8E8E8] bg-white p-4 sm:p-6 shadow rounded-2xl">
          <ProfileTopBlock user={profileUser} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <ActivityTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <ActivityContent
            activeTab={activeTab}
            posts={activeTab === "feed" ? userPosts : []}
            isLoading={postsLoading}
            currentUser={currentUser}
            onLike={likeMutation.mutate}
            onDelete={deleteMutation.mutate} 
          />
        </div>
      </div>
    </div>
  );
}
