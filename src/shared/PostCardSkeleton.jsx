const PostCardSkeleton = () => (
  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 animate-pulse">
    <div className="flex items-start gap-3 mb-5">
      <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-32" />
        <div className="h-2.5 bg-gray-100 rounded w-20" />
      </div>
    </div>
    <div className="space-y-2 mb-5">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
    <div className="flex gap-6">
      <div className="h-4 bg-gray-200 rounded w-10" />
      <div className="h-4 bg-gray-200 rounded w-10" />
      <div className="h-4 bg-gray-200 rounded w-10" />
    </div>
  </div>
);

export default PostCardSkeleton;
