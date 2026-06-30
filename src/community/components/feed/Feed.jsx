import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CreatePost from "./CreatePost";
import PostCard from "../../../shared/PostCard";
import AnnouncementCard from "../../../shared/AnnouncementCard";
import { getFeed, toggleLike } from "../../../services/PostService";
import { getAnnouncements } from "../../../services/AnnouncementService";
import { getMe } from "../../../services/UserService";
import PostCardSkeleton from "../../../shared/PostCardSkeleton";

const TABS = [
  { key: "forYou",        label: "For You" },
  { key: "following",     label: "Following" },
  { key: "announcements", label: "📢 Announcements" },
];

const Feed = () => {
  const queryClient = useQueryClient();
  const [feedType, setFeedType] = useState("forYou");
  const observerRef = useRef(null);

  const { data: currentUser } = useQuery({ queryKey: ["me"], queryFn: getMe });

  // Posts feed (forYou + following)
  const {
    data: postsData,
    isLoading: postsLoading,
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
    enabled: feedType !== "announcements",
  });

  // Announcements feed
  const {
    data: announcementsData,
    isLoading: announcementsLoading,
    isFetchingNextPage: isFetchingMoreAnnouncements,
    hasNextPage: hasMoreAnnouncements,
    fetchNextPage: fetchMoreAnnouncements,
  } = useInfiniteQuery({
    queryKey: ["announcements"],
    queryFn: ({ pageParam = 1 }) => getAnnouncements(pageParam, 20),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage?.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    enabled: feedType === "announcements",
  });

  const posts = postsData?.pages?.flatMap((p) => p.posts) || [];
  const announcements = announcementsData?.pages?.flatMap((p) => p.announcements) || [];

  const isLoading = feedType === "announcements" ? announcementsLoading : postsLoading;
  const isEmpty = feedType === "announcements" ? announcements.length === 0 : posts.length === 0;

  // Infinite scroll sentinel
  const sentinelRef = useCallback(
    (node) => {
      if (!node) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          if (feedType === "announcements" && hasMoreAnnouncements && !isFetchingMoreAnnouncements) {
            fetchMoreAnnouncements();
          } else if (feedType !== "announcements" && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [feedType, hasNextPage, isFetchingNextPage, fetchNextPage, hasMoreAnnouncements, isFetchingMoreAnnouncements, fetchMoreAnnouncements]
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

  const emptyMessages = {
    forYou: "No posts yet. Be the first to post! 🙏",
    following: "No posts from people you follow yet. Follow someone to see their posts here! 🙏",
    announcements: "No announcements yet. Check back soon! 📢",
  };

  return (
    <main className="flex-1 space-y-4">
      {feedType !== "announcements" && <CreatePost />}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFeedType(tab.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              feedType === tab.key
                ? "bg-[#401667] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab.label}
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
      {!isLoading && isEmpty && (
        <div className="text-center py-10 text-gray-400 text-sm">
          {emptyMessages[feedType]}
        </div>
      )}

      {/* Posts */}
      {feedType !== "announcements" && posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          variant="feed"
          isOwnPost={post.authorId?._id?.toString() === currentUser?._id?.toString()}
          onLike={() => likeMutation.mutate(post._id)}
        />
      ))}

      {/* Announcements */}
      {feedType === "announcements" && announcements.map((a) => (
        <AnnouncementCard key={a._id} announcement={a} />
      ))}

      {/* Infinite scroll sentinel */}
      {(hasNextPage || hasMoreAnnouncements) && <div ref={sentinelRef} className="h-4" />}

      {(isFetchingNextPage || isFetchingMoreAnnouncements) && (
        <div className="space-y-4"><PostCardSkeleton /></div>
      )}
    </main>
  );
};

export default Feed;
