import emptyState from "../../../assets/icons/empty-state.png";
import PostCard from '../../../shared/PostCard';

const EmptyFeedState = () => {
  return (
    <div className="w-full bg-white border border-[#E8E8E8] rounded-2xl sm:rounded-3xl py-16 sm:py-20 px-4 flex flex-col items-center justify-center text-center">
      <img
        src={emptyState}
        alt="No new posts"
        className="w-32 sm:w-40 mb-6 opacity-90 max-w-full"
      />
      <p className="text-gray-600 text-sm">No posts yet</p>
    </div>
  );
};

const MembersPlaceholder = () => {
  return (
    <div className="w-full bg-white border border-[#E8E8E8] rounded-2xl sm:rounded-3xl py-16 sm:py-20 px-4 flex flex-col items-center justify-center text-center">
      <img
        src={emptyState}
        alt="No communities"
        className="w-32 sm:w-40 mb-6 opacity-90 max-w-full"
      />
      <p className="text-gray-600 text-sm max-w-xs">
        You currently do not own any communities. Join or create one to see it here!
      </p>
    </div>
  );
};

const ActivityContent = ({ 
  activeTab, 
  posts = [], 
  isLoading = false,
  currentUser = null,
  onLike,
  onDelete
}) => {
  if (activeTab === 'members') {
    return <MembersPlaceholder />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyFeedState />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post._id || post.id}
          post={{
            id: post._id || post.id,
            _id: post._id || post.id, 
            authorId: post.authorId,
            author: {
              name: post.authorId?.fullName || post.author || "Unknown",
              avatar: post.authorId?.avatarUrl || post.avatar || null,
            },
            content: post.body || post.content,
            body: post.body || post.content,
            image: post.mediaUrls?.[0] || post.image || null,
            images: post.mediaUrls || (post.image ? [post.image] : []),
            mediaUrls: post.mediaUrls || [], 
            time: post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : post.time,
            createdAt: post.createdAt, 
            likes: post.likes || [], 
            isLiked: post.likes?.some(likeId => likeId?.toString() === currentUser?._id?.toString()) || false,
            comments: post.comments || 0,
            commentsCount: post.commentsCount || 0,
            hashtags: post.hashtags || [],
          }}
          variant="profile"
          isOwnPost={ 
            post.authorId?._id?.toString() === currentUser?._id?.toString() ||
            post.authorId?.toString() === currentUser?._id?.toString()
        }
          onLike={() => onLike?.(post._id || post.id)}
          onDelete={() => onDelete?.(post._id || post.id)}
        />
      ))}
    </div>
  );
};

export default ActivityContent;