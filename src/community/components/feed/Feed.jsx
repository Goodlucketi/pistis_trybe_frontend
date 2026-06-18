import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CreatePost from "./CreatePost";
import PostCard from "../../../shared/PostCard";
import { getFeed, toggleLike } from "../../../services/PostService";
import { getMe } from "../../../services/UserService";
import PostCardSkeleton from "../../../shared/PostCardSkeleton";

const Feed = () => {
  const queryClient = useQueryClient();
  const [feedType, setFeedType] = useState("forYou");
  const observerRef = useRef(null);

  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: getMe });

  // FIX: Use infinite query for proper pagination / infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", feedType],
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam, 20, feedType),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage?.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
  });

  const posts = data?.pages?.flatMap((p) => p.posts) || [];

  // Infinite scroll sentinel
  const sentinelRef = useCallback(
    (node) => {
      if (!node) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const likeMutation = useMutation({
    mutationFn: (postId) => toggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed", feedType] });
      const prev = queryClient.getQueryData(["feed", feedType]);
      queryClient.setQueryData(["feed", feedType], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) => {
              if (p._id !== postId) return p;
              const userId = currentUser?._id;
              const liked = p.likes?.some((id) => (id?._id || id)?.toString() === userId?.toString());
              return {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => (id?._id || id)?.toString() !== userId?.toString())
                  : [...(p.likes || []), userId],
              };
            }),
          })),
        };
      });
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) queryClient.setQueryData(["feed", feedType], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feed", feedType] }),
  });

  return (
    <main className="flex-1 space-y-4">
      <CreatePost />

      {/* Feed Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex gap-2">
        {["forYou", "following"].map((type) => (
          <button
            key={type}
            onClick={() => setFeedType(type)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              feedType === type
                ? "bg-[#401667] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {type === "forYou" ? "For You" : "Following"}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          {feedType === "following"
            ? "No posts from people you follow yet. Follow someone to see their posts here! 🙏"
            : "No posts yet. Be the first to post! 🙏"}
        </div>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          variant="feed"
          isOwnPost={post.authorId?._id?.toString() === currentUser?._id?.toString()}
          onLike={() => likeMutation.mutate(post._id)}
        />
      ))}

      {/* Infinite scroll sentinel */}
      {hasNextPage && <div ref={sentinelRef} className="h-4" />}

      {isFetchingNextPage && (
        <div className="space-y-4">
          <PostCardSkeleton />
        </div>
      )}
    </main>
  );
};

export default Feed;
