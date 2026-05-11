import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useCommunityStore from "../../store/useCommunityStore";
import CreatePost from "./CreatePost";
import PostCard from "../../../shared/PostCard";
import BibleReader from "./BibleReader";
import { getFeed, toggleLike } from '../../../services/PostService';
import { getMe } from '../../../services/UserService';

const Feed = () => {
  const { activeView } = useCommunityStore();
  const queryClient = useQueryClient();
  const [feedType, setFeedType] = useState("forYou");

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['feed', feedType],
    queryFn: () => getFeed(1, 20, feedType),
  });

  const likeMutation = useMutation({
    mutationFn: (postId) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const posts = data?.posts || [];

  if (activeView === "bible") {
    return (
      <main className="flex-1">
        <BibleReader />
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-4">
      <CreatePost />

      {/* Feed Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex gap-2">
        <button
          onClick={() => setFeedType("forYou")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            feedType === "forYou"
              ? "bg-[#401667] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setFeedType("following")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            feedType === "following"
              ? "bg-[#401667] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          Following
        </button>
      </div>

      {/* Posts */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          {feedType === "following"
            ? "No posts from people you follow yet. Follow someone to see their posts here! 🙏"
            : "No posts yet. Be the first to post! 🙏"}
        </div>
      )}

      {posts.map((post) => {
        const isOwnPost = post.authorId?._id === currentUser?._id;
        return (
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
              image: post.mediaUrls?.[0] || null,
              images: post.mediaUrls || [],
              time: new Date(post.createdAt).toLocaleDateString(),
              likes: post.likes?.length || 0,
              comments: 0,
              hashtags: post.hashtags || [],
            }}
            variant="feed"
            isOwnPost={isOwnPost}
            onLike={() => likeMutation.mutate(post._id)}
          />
        );
      })}
    </main>
  );
};

export default Feed;