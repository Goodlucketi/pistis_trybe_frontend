import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CommunityCard from "../CommunityCard";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { getGroups, joinLeaveGroup } from "../../../../services/GroupService";

const Communities = ({ variant = "sidebar", currentUserId }) => {
  const queryClient = useQueryClient();
  const isFeedView = variant === "feed";

  const { data: allGroups = [], isLoading, isError } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const joinLeaveMutation = useMutation({
    mutationFn: joinLeaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const handleJoinLeave = (id) => {
    joinLeaveMutation.mutate(id);
  };

  const { yourGroups, suggestedGroups } = useMemo(() => {
    const your = [];
    const suggested = [];

    allGroups.forEach((group) => {
      if (group.isMember) {
        your.push(group);
      } else {
        suggested.push(group);
      }
    });

    return { yourGroups: your, suggestedGroups: suggested };
  }, [allGroups]);

  const getUserRole = (group) => {
    if (!group.isMember) return "non-member";
    return group.role || "member";
  };

  const renderSection = (title, groups, emptyText) => {
    // For sidebar: don't render section if empty
    if (groups.length === 0 &&!isFeedView) return null;

    return (
      <div className="space-y-4">
        <h2
          className={clsx(
            "font-semibold text-gray-800",
            isFeedView? "text-xl" : "text-md"
          )}
        >
          {title}
        </h2>

        {isLoading? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0? (
          <p className="text-gray-500 text-sm py-8 text-center">{emptyText}</p>
        ) : (
          <div
            className={clsx(
              isFeedView
             ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-6"
            )}
          >
            {groups.map((group) => (
              <CommunityCard
                key={group.id}
                community={group}
                userRole={getUserRole(group)}
                onJoin={() => handleJoinLeave(group.id)}
                isLoading={joinLeaveMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500 text-sm">
        Failed to load groups. Try again.
      </div>
    );
  }

  const hasNoGroups =!isLoading && yourGroups.length === 0 && suggestedGroups.length === 0;

  return (
    <div
      className={clsx(
        "space-y-8",
        variant === "sidebar" && "mt-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto"
      )}
    >
      {!isFeedView && (
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">Groups</h1>
          <Link
            to="/dashboard/groups"
            className="text-sm text-[#401667] hover:underline"
          >
            See All
          </Link>
        </div>
      )}

      {/* Show empty state for sidebar when no groups */}
      {!isFeedView && hasNoGroups? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No groups available yet</p>
          <Link
            to="/dashboard/groups"
            className="text-sm text-[#401667] hover:underline mt-2 inline-block"
          >
            Explore groups
          </Link>
        </div>
      ) : (
        <>
          {renderSection(
            "Groups You Belong To",
            yourGroups,
            "You haven't joined any groups yet"
          )}

          {yourGroups.length > 0 && suggestedGroups.length > 0 && (
            <hr className="border-gray-200" />
          )}

          {renderSection(
            isFeedView? "Other Groups" : "Groups you can join",
            suggestedGroups,
            "No suggested groups right now"
          )}
        </>
      )}
    </div>
  );
};

export default Communities;