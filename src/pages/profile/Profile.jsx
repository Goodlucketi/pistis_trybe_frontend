import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProfileTopBlock from "../../community/components/profile/ProfileTopBlock";
import ActivityTabs from "../../community/components/profile/Activitytabs";
import ActivityContent from "../../community/components/profile/ActivityContent";
import { getMe } from '../../services/UserService';
import { getFollowers, getFollowing } from '../../services/UserService';
import { getUserPosts } from '../../services/UserService';

export default function Profile() {
  const [activeTab, setActiveTab] = useState("feed");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: followersData } = useQuery({
    queryKey: ['followers', user?._id],
    queryFn: () => getFollowers(user._id),
    enabled: !!user?._id,
  });

  const { data: followingData } = useQuery({
    queryKey: ['following', user?._id],
    queryFn: () => getFollowing(user._id),
    enabled: !!user?._id,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', user?._id],
    queryFn: () => getUserPosts(user._id),
    enabled: !!user?._id,
  });

  const userPosts = postsData?.posts || [];

  const profileUser = user ? {
    _id: user._id,
    name: user.fullName || user.email,
    avatar: user.avatarUrl,
    biography: user.biography,
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
          />
        </div>
      </div>
    </div>
  );
}
