import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X, Users } from "lucide-react";
import { discoverUsers } from "../../services/UserService";
import PersonCard from "../../community/components/people/PersonCard";

const useDebounced = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const People = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = useState(searchParams.get("q") || "");
  const query = useDebounced(text.trim());
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setText((current) => (current === urlQuery ? current : urlQuery));
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(query ? { q: query } : {}, { replace: true });
  }, [query, setSearchParams]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["people", query],
    queryFn: ({ pageParam }) => discoverUsers({ query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
  });

  const people = data?.pages.flatMap((p) => p.users) || [];

  const handleFollowChange = (id, following) => {
    queryClient.setQueryData(["people", query], (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          users: page.users.map((u) => (u._id === id ? { ...u, isFollowing: following } : u)),
        })),
      }
    );
  };

  return (
    <div className="w-full px-2 py-2 pb-24">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <p className="text-sm text-gray-500 mt-1">Find members of the Pistis family and follow them.</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search by name"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-300 bg-white/60 text-gray-900 placeholder:text-gray-400"
        />
        {text && (
          <button type="button" onClick={() => setText("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400" aria-label="Clear search">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!query && !isLoading && people.length > 0 && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Suggested people</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-center py-16 text-sm text-red-500">Could not load people. Please try again.</p>
      ) : people.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{query ? `No one found matching "${query}".` : "No one to show yet."}</p>
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

export default People;
