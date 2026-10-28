import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Lock, Users } from "lucide-react";
import clsx from "clsx";
import { getFollowers, getFollowing, getUserById } from "../../services/UserService";
import PersonCard from "../../community/components/people/PersonCard";

const TABS = [
  { key: "followers", label: "Followers", fetcher: getFollowers },
  { key: "following", label: "Following", fetcher: getFollowing },
];

const Connections = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "following" ? "following" : "followers";
  const active = TABS.find((t) => t.key === tab);

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
  });

  const canView = !!profileUser?.canViewConnections;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["connections", userId, tab],
    queryFn: ({ pageParam }) => active.fetcher(userId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
    enabled: canView,
  });

  const people = data?.pages.flatMap((p) => p.users) || [];

  const handleFollowChange = (id, following) => {
    queryClient.setQueryData(["connections", userId, tab], (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          users: page.users.map((u) => (u._id === id ? { ...u, isFollowing: following } : u)),
        })),
      }
    );
  };

  if (userLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-gray-400">User not found.</div>;
  }

  return (
    <div className="w-full px-2 py-2 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{profileUser.fullName || "Connections"}</h1>

      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 mb-5 w-full sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSearchParams({ tab: t.key }, { replace: true })}
            className={clsx(
              "flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition",
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-gray-400">
              {t.key === "followers" ? profileUser.followersCount : profileUser.followingCount}
            </span>
          </button>
        ))}
      </div>

      {!canView ? (
        <div className="text-center py-16 text-gray-400">
          <Lock className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm max-w-xs mx-auto">
            You can see {profileUser.fullName || "this person"}'s followers and following once you follow each other.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-center py-16 text-sm text-red-500">Could not load this list. Please try again.</p>
      ) : people.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{tab === "followers" ? "No followers yet." : "Not following anyone yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {people.map((person) => (
            <PersonCard key={person._id} person={person} onFollowChange={handleFollowChange} />
          ))}
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;
